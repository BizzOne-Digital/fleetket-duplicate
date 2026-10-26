'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { db, getCategories, getPlan, getPlans } from '@/lib/content'
import { notifyAdmin } from '@/lib/listing-service'
import { flattenErrors, taskerProfileSchema, type FormState } from '@/lib/schemas'
import { geocode } from '@/lib/geocode'
import { CURRENT_MEMBERSHIP, alignTaskerRows, claimPromoCode, membershipRow, syncMembership } from '@/lib/membership'
import { Subscriber, User } from '@/lib/models'
import { createCustomer, createPortalSession, createSubscriptionCheckout, expireOpenCheckouts, isStripeConfigured, listSubscriptions, setSubscriptionQuantity, type StripeSubscription } from '@/lib/stripe'

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
 * The tasker's live membership, asked of Stripe directly — the webhook may not have recorded it yet (or at all), and
 * trusting only our copy let new categories be added without being billed. A membership found this way is saved.
 */
async function liveMembership(userId: string, customerId: string): Promise<StripeSubscription | null> {
  if (!isStripeConfigured || !customerId) return null
  let subs: StripeSubscription[]
  try {
    subs = await listSubscriptions(customerId)
  } catch (err) {
    if (/No such customer/.test(String(err))) return null // saved under another Stripe key: no membership here
    throw err
  }
  const live = subs.find((s) => CURRENT_MEMBERSHIP.includes(s.status) && s.metadata?.userId === userId) ?? null
  if (live) await syncMembership(live)
  return live
}

/**
 * A tasker adds or removes services at any time. Each category is its own Subscriber row: kept categories only get
 * their services updated, new categories get a new row (same approval and membership as the rest), emptied categories
 * are removed. With a live membership, Stripe bills the new number of categories straight away (prorated) and nothing
 * is saved unless that payment goes through. Without one, the services are saved and the tasker goes to Checkout to
 * pay for all their categories — added categories are never free.
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
  let trialEnds = ''
  let planSlug = row.membershipPlan
  let added: [string, string[]][] = []
  try {
    const rows = await Subscriber.find({ userId: user.id }).lean()
    const before = new Set(rows.map((r) => r.category))
    added = [...byCategory].filter(([cat]) => !before.has(cat))
    // Stripe first, so the bill never lags behind what the tasker is listed for.
    const sub = await liveMembership(user.id, row.stripeCustomerId)
    if (sub) {
      if ((sub.items?.data?.[0]?.quantity ?? 1) !== byCategory.size) {
        const updated = await setSubscriptionQuantity(sub, byCategory.size)
        if (updated.pending_update) {
          return { ok: false, message: 'Your card was declined for the added categories, so nothing was changed. Update your card with “Manage payment or cancel”, then try again.' }
        }
        changed = true
      }
      billed = byCategory.size
      planSlug = sub.metadata?.plan || planSlug
      const periodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end
      if (sub.status === 'trialing' && periodEnd) trialEnds = new Date(periodEnd * 1000).toISOString().slice(0, 10)
    }
    await Promise.all(rows.filter((r) => byCategory.has(r.category)).map((r) => Subscriber.updateOne({ _id: r._id }, { $set: { subServices: byCategory.get(r.category) } })))
    await Subscriber.deleteMany({ userId: user.id, category: { $nin: [...byCategory.keys()] } })
    // Re-read: liveMembership may just have saved the membership onto the rows.
    const template = (await Subscriber.findOne({ userId: user.id }).sort('-stripeSubscriptionId').lean()) ?? rows[0]
    if (template && added.length) {
      const { _id, category: _c, subServices: _s, createdAt: _a, updatedAt: _u, ...shared } = template as typeof template & { createdAt?: Date; updatedAt?: Date }
      await Subscriber.insertMany(added.map(([category, subServices]) => ({ ...shared, category, subServices, ...(billed && { billedCategories: billed }) })))
    }
    if (billed) await Subscriber.updateMany({ userId: user.id }, { $set: { billedCategories: billed } })
    // Added categories show wherever the rest of the account shows: same approval, visibility and map pin.
    await alignTaskerRows(user.id)
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
  const plan = billed ? await getPlan(planSlug) : null
  const price = plan ? `$${(plan.amount * billed).toFixed(2)}${plan.currency ? ` ${plan.currency}` : ''} / ${plan.interval}` : ''
  await notifyAdmin(`Tasker updated their services — ${user.name}`, { Tasker: user.name, Email: user.email, Services: names.join(' | '), Billing: billed ? `${billed} categor${billed === 1 ? 'y' : 'ies'} — ${price}` : 'no active membership' })
  revalidatePath('/', 'layout')

  // No live membership and new categories: payment comes next — straight to Stripe Checkout for all categories.
  if (!billed && added.length && isStripeConfigured) {
    const memberPlan = (await getPlan(planSlug)) ?? (await getPlans()).find((p) => p.billing === 'subscription' && p.payer === 'provider' && p.amount > 0)
    if (memberPlan) {
      const checkout = new FormData()
      checkout.set('plan', memberPlan.slug)
      await startMembership(checkout) // redirects to Stripe
    }
  }

  const count = `${billed} categor${billed === 1 ? 'y' : 'ies'}`
  return {
    ok: true,
    message: billed
      ? trialEnds
        ? `Saved. You’re in your free period — from ${trialEnds} you’ll be billed for ${count} (${price}).`
        : changed
          ? `Saved. You’re now billed for ${count} (${price}); the prorated difference has been charged to your card. Your membership continues as normal.`
          : `Saved — your bill is unchanged (${count}, ${price}).`
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

/**
 * A tasker updates their name, phone and address. Every category row gets the same details, and the map pin is
 * re-placed from the new address (a failed lookup keeps the old pin).
 */
export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const { user } = await taskerMembership()
  const parsed = taskerProfileSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: flattenErrors(parsed.error) }
  const data = parsed.data
  try {
    const location = await geocode(data)
    await User.updateOne({ _id: user.id }, { $set: data })
    await Subscriber.updateMany({ userId: user.id }, { $set: { ...data, contactName: data.name, ...(location && { location }) } })
  } catch (err) {
    console.error('[tasker] profile update failed', err)
    return { ok: false, message: 'We couldn’t save your details just now. Please try again, or contact us.' }
  }
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Saved — your details are updated.' }
}
