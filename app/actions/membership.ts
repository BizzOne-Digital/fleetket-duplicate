'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { db, getCategories, getPlan } from '@/lib/content'
import { notifyAdmin } from '@/lib/listing-service'
import type { FormState } from '@/lib/schemas'
import { CURRENT_MEMBERSHIP, claimPromoCode, membershipRow } from '@/lib/membership'
import { Subscriber, User } from '@/lib/models'
import { createCustomer, createPortalSession, createSubscriptionCheckout, expireOpenCheckouts, getSubscription, isStripeConfigured, listSubscriptions, setSubscriptionQuantity } from '@/lib/stripe'

const DAY = 86_400

async function origin() {
  const h = await headers()
  return `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('x-forwarded-host') ?? h.get('host')}`
}

async function taskerMembership() {
  const user = await requireUser('/account')
  if (user.role !== 'provider') redirect('/account')
  await db()
  const row = await membershipRow(user.id)
  if (!row) redirect('/account?membership=error')
  return { user, row }
}

/**
 * Tasker → Stripe Checkout for a recurring membership plan (Admin → Pricing plans: billing “subscription”, paid by provider).
 * Duplicate guards: one Stripe customer per tasker (created idempotently and saved before checkout); Stripe itself is
 * asked whether that customer already has a live subscription; older open Checkout pages are expired so only one can
 * be paid. The webhook cancels any duplicate that still slips through (lib/membership.ts).
 */
export async function startMembership(form: FormData) {
  if (!isStripeConfigured) redirect('/account?membership=unavailable')
  const { user, row } = await taskerMembership()
  const plan = await getPlan(String(form.get('plan') ?? ''))
  if (!plan || plan.billing !== 'subscription' || plan.payer !== 'provider' || plan.amount <= 0) redirect('/account?membership=error')

  // A promo code entered here (not only at sign-up) gives the same free period — first membership only, checked here.
  const promoCode = String(form.get('promoCode') ?? '').trim().toUpperCase()
  if (promoCode && !row.freeUntil) {
    if (row.stripeSubscriptionId) redirect('/account?membership=promo-ineligible')
    const freeUntil = await claimPromoCode(promoCode)
    if (!freeUntil) redirect('/account?membership=promo-invalid')
    await Subscriber.updateMany({ userId: user.id }, { $set: { promoCode, freeUntil } })
    row.freeUntil = freeUntil
  }

  const base = await origin()
  let url: string | null = null
  if (!(await lockCheckout(user.id))) redirect('/account?membership=error')
  try {
    let customerId = row.stripeCustomerId
    if (!customerId) {
      customerId = (await createCustomer({ userId: user.id, email: user.email, name: user.name })).id
      await Subscriber.updateMany({ userId: user.id }, { $set: { stripeCustomerId: customerId } })
    }
    let existing
    try {
      existing = await listSubscriptions(customerId)
    } catch (err) {
      // A customer saved under another Stripe key (e.g. test mode before going live) doesn't exist here: start fresh.
      if (!/No such customer/.test(String(err))) throw err
      const stale = customerId
      customerId = (await createCustomer({ userId: user.id, email: user.email, name: user.name, replaces: stale })).id
      await Subscriber.updateMany({ userId: user.id }, { $set: { stripeCustomerId: customerId, stripeSubscriptionId: '', membershipStatus: '' } })
      row.stripeSubscriptionId = ''
      existing = await listSubscriptions(customerId)
    }
    if (existing.some((s) => CURRENT_MEMBERSHIP.includes(s.status) || s.status === 'incomplete')) {
      url = '/account?membership=exists'
    } else {
      await expireOpenCheckouts(customerId)
      // Free period: the promo code's “free until” day, else the plan's trial — only if they've never subscribed.
      const firstTime = existing.length === 0 && !row.stripeSubscriptionId
      const promoEnd = row.freeUntil ? Math.floor(new Date(`${row.freeUntil}T23:59:59Z`).getTime() / 1000) : 0
      const trialEnd = firstTime && promoEnd > Date.now() / 1000 + 2 * DAY ? promoEnd : undefined
      // One membership per category the tasker offers (one Subscriber row per category).
      // ponytail: quantity is set at checkout; categories added later don't change an existing subscription — update it in Stripe.
      const quantity = (await Subscriber.distinct('category', { userId: user.id })).length || 1
      const session = await createSubscriptionCheckout({
        userId: user.id,
        plan,
        quantity,
        customerId,
        trialEnd,
        trialDays: firstTime && !trialEnd ? plan.trialDays : undefined,
        // The return page only says “confirming” — the membership is recorded when Stripe's webhook confirms it.
        successUrl: `${base}/account?membership=processing`,
        cancelUrl: `${base}/account?membership=cancelled`,
      })
      url = session.url
    }
  } catch (err) {
    console.error('[membership] checkout failed', err)
  } finally {
    await User.updateOne({ _id: user.id }, { $set: { checkoutLockUntil: null } })
  }
  redirect(url ?? '/account?membership=error')
}

/**
 * A tasker adds or removes services at any time. Each category is its own Subscriber row: kept categories only get
 * their services updated, new categories get a new row (same approval and membership as the rest), emptied categories
 * are removed. A live membership keeps running — Stripe only changes how many categories it bills (prorated).
 */
export async function updateSkills(_prev: FormState, form: FormData): Promise<FormState> {
  const { user, row } = await taskerMembership()
  const categories = await getCategories()
  const byCategory = new Map<string, string[]>()
  for (const skill of form.getAll('skills').map(String)) {
    const [cat, sub] = skill.split('/')
    if (!categories.find((c) => c.slug === cat)?.subServices.some((s) => s.slug === sub)) {
      return { ok: false, message: 'One of the chosen services is no longer available — please choose again.', errors: { skills: 'Please choose again' } }
    }
    if (!byCategory.get(cat)?.includes(sub)) byCategory.set(cat, [...(byCategory.get(cat) ?? []), sub])
  }
  if (!byCategory.size) {
    return { ok: false, message: 'Keep at least one service. To stop completely, cancel your membership instead.', errors: { skills: 'Choose at least one service' } }
  }

  if (!(await lockCheckout(user.id))) return { ok: false, message: 'Another change is still being saved — please try again in a moment.' }
  let billed = 0
  let changed = false
  try {
    const rows = await Subscriber.find({ userId: user.id }).lean()
    const before = new Set(rows.map((r) => r.category))
    // Stripe first, so the bill never lags behind what the tasker is listed for.
    if (row.stripeSubscriptionId && CURRENT_MEMBERSHIP.includes(row.membershipStatus)) {
      const sub = await getSubscription(row.stripeSubscriptionId)
      if (CURRENT_MEMBERSHIP.includes(sub.status) && (sub.items?.data?.[0]?.quantity ?? 1) !== byCategory.size) {
        await setSubscriptionQuantity(sub, byCategory.size)
        changed = true
      }
      if (CURRENT_MEMBERSHIP.includes(sub.status)) billed = byCategory.size
    }
    await Promise.all(rows.filter((r) => byCategory.has(r.category)).map((r) => Subscriber.updateOne({ _id: r._id }, { $set: { subServices: byCategory.get(r.category) } })))
    await Subscriber.deleteMany({ userId: user.id, category: { $nin: [...byCategory.keys()] } })
    const template = rows.find((r) => r.stripeSubscriptionId) ?? rows[0]
    const added = [...byCategory].filter(([cat]) => !before.has(cat))
    if (template && added.length) {
      const { _id, category: _c, subServices: _s, createdAt: _a, updatedAt: _u, ...shared } = template as typeof template & { createdAt?: Date; updatedAt?: Date }
      await Subscriber.insertMany(added.map(([category, subServices]) => ({ ...shared, category, subServices, ...(billed && { billedCategories: billed }) })))
    }
    if (billed) await Subscriber.updateMany({ userId: user.id }, { $set: { billedCategories: billed } })
  } catch (err) {
    console.error('[membership] skills update failed', err)
    return { ok: false, message: 'We couldn’t save your services just now. Please try again, or contact us.' }
  } finally {
    await User.updateOne({ _id: user.id }, { $set: { checkoutLockUntil: null } })
  }

  const names = [...byCategory].map(([cat, subs]) => {
    const c = categories.find((x) => x.slug === cat)!
    return `${c.name}: ${subs.map((s) => c.subServices.find((x) => x.slug === s)?.name ?? s).join(', ')}`
  })
  const plan = billed ? await getPlan(row.membershipPlan) : null
  const price = plan ? `$${(plan.amount * billed).toFixed(2)}${plan.currency ? ` ${plan.currency}` : ''} / ${plan.interval}` : ''
  await notifyAdmin(`Tasker updated their services — ${user.name}`, { Tasker: user.name, Email: user.email, Services: names.join(' | '), Billing: billed ? `${billed} categor${billed === 1 ? 'y' : 'ies'} — ${price}` : 'no active membership' })
  revalidatePath('/', 'layout')
  return {
    ok: true,
    message: billed
      ? changed
        ? `Saved. You’re now billed for ${billed} categor${billed === 1 ? 'y' : 'ies'} (${price}); the difference is prorated on your next invoice. Your membership continues as normal.`
        : `Saved — your bill is unchanged (${billed} categor${billed === 1 ? 'y' : 'ies'}, ${price}).`
      : 'Saved — your services are updated.',
  }
}

/**
 * Runs one membership checkout per tasker at a time: a second click waits, then sees the first one's Checkout page
 * and expires it before opening its own — so only one page is ever payable. The lock times out after 30s.
 */
async function lockCheckout(userId: string) {
  for (let i = 0; i < 60; i++) {
    const now = new Date()
    const got = await User.updateOne(
      { _id: userId, $or: [{ checkoutLockUntil: null }, { checkoutLockUntil: { $lt: now } }] },
      { $set: { checkoutLockUntil: new Date(now.getTime() + 30_000) } },
    )
    if (got.modifiedCount) return true
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}

/** Stripe's customer portal: update the card, see invoices, or cancel (renewal continues until they do). */
export async function openBillingPortal() {
  if (!isStripeConfigured) redirect('/account?membership=unavailable')
  const { row } = await taskerMembership()
  if (!row.stripeCustomerId) redirect('/account')
  let url: string | null = null
  try {
    url = (await createPortalSession(row.stripeCustomerId, `${await origin()}/account`)).url
  } catch (err) {
    console.error('[membership] portal failed', err)
  }
  redirect(url ?? '/account?membership=error')
}
