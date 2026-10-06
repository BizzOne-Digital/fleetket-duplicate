'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { db, getPlan } from '@/lib/content'
import { CURRENT_MEMBERSHIP, membershipRow } from '@/lib/membership'
import { Subscriber, User } from '@/lib/models'
import { createCustomer, createPortalSession, createSubscriptionCheckout, expireOpenCheckouts, isStripeConfigured, listSubscriptions } from '@/lib/stripe'

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

  const base = await origin()
  let url: string | null = null
  if (!(await lockCheckout(user.id))) redirect('/account?membership=error')
  try {
    let customerId = row.stripeCustomerId
    if (!customerId) {
      customerId = (await createCustomer({ userId: user.id, email: user.email, name: user.name })).id
      await Subscriber.updateMany({ userId: user.id }, { $set: { stripeCustomerId: customerId } })
    }
    const existing = await listSubscriptions(customerId)
    if (existing.some((s) => CURRENT_MEMBERSHIP.includes(s.status) || s.status === 'incomplete')) {
      url = '/account?membership=exists'
    } else {
      await expireOpenCheckouts(customerId)
      // Free period: the promo code's “free until” day, else the plan's trial — only if they've never subscribed.
      const firstTime = existing.length === 0 && !row.stripeSubscriptionId
      const promoEnd = row.freeUntil ? Math.floor(new Date(`${row.freeUntil}T23:59:59Z`).getTime() / 1000) : 0
      const trialEnd = firstTime && promoEnd > Date.now() / 1000 + 2 * DAY ? promoEnd : undefined
      const session = await createSubscriptionCheckout({
        userId: user.id,
        plan,
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
