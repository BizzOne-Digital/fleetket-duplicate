import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Stripe Checkout over its REST API — no SDK needed. One-off payments for ads, recurring subscriptions for
 * tasker memberships. Set STRIPE_SECRET_KEY (sk_live_… for real payments) and STRIPE_WEBHOOK_SECRET for the
 * webhook at /api/stripe/webhook. Without a key, paid ads are saved as “awaiting payment” for the admin.
 */
export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY)

export type CheckoutSession = {
  id: string
  url: string | null
  mode?: 'payment' | 'subscription' | 'setup'
  /** mode = subscription: the subscription it created. */
  subscription?: string | null
  payment_status: 'paid' | 'unpaid' | 'no_payment_required'
  client_reference_id: string | null
  amount_total: number | null
  currency: string | null
}

async function stripe<T>(path: string, body?: URLSearchParams, o: { method?: string; idempotencyKey?: string } = {}): Promise<T> {
  // STRIPE_API_BASE: only for the local end-to-end test against a fake Stripe.
  const res = await fetch(`${process.env.STRIPE_API_BASE || 'https://api.stripe.com'}/v1/${path}`, {
    method: o.method ?? (body ? 'POST' : 'GET'),
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(o.idempotencyKey ? { 'Idempotency-Key': o.idempotencyKey } : {}),
    },
    body,
    cache: 'no-store',
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Stripe ${path}: ${json?.error?.message ?? res.status}`)
  return json as T
}

export type StripeSubscription = {
  id: string
  customer: string
  status: string
  cancel_at_period_end: boolean
  cancel_at?: number | null
  /** Older API versions put the period on the subscription, newer ones on its items. */
  current_period_end?: number
  items?: { data: { current_period_end?: number }[] }
  metadata: { userId?: string; plan?: string }
}

/**
 * A membership: Checkout for a subscription that renews every `interval` until the member cancels.
 * Pass `trialEnd` (unix seconds, 48h+ ahead) for a promo-code free period, or `trialDays` for the plan's trial.
 */
export function createSubscriptionCheckout(o: {
  userId: string
  plan: { slug: string; name: string; amount: number; currency: string; interval: 'month' | 'year' }
  customerId: string
  trialEnd?: number
  trialDays?: number
  successUrl: string
  cancelUrl: string
}) {
  const body = new URLSearchParams({
    mode: 'subscription',
    customer: o.customerId,
    client_reference_id: o.userId,
    'metadata[userId]': o.userId,
    'subscription_data[metadata][userId]': o.userId,
    'subscription_data[metadata][plan]': o.plan.slug,
    success_url: o.successUrl,
    cancel_url: o.cancelUrl,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': (o.plan.currency || 'CAD').toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(Math.round(o.plan.amount * 100)),
    'line_items[0][price_data][recurring][interval]': o.plan.interval,
    'line_items[0][price_data][product_data][name]': `Fleeket ${o.plan.name}`,
  })
  if (o.trialEnd) body.set('subscription_data[trial_end]', String(o.trialEnd))
  else if (o.trialDays) body.set('subscription_data[trial_period_days]', String(o.trialDays))
  return stripe<CheckoutSession>('checkout/sessions', body)
}

export const getSubscription = (id: string) => stripe<StripeSubscription>(`subscriptions/${encodeURIComponent(id)}`)

/**
 * One Stripe customer per tasker. The idempotency key makes simultaneous first clicks (two tabs, a double-click)
 * get the same customer back instead of creating two.
 */
export const createCustomer = (o: { userId: string; email: string; name: string }) =>
  stripe<{ id: string }>('customers', new URLSearchParams({ email: o.email, name: o.name, 'metadata[userId]': o.userId }), { idempotencyKey: `fleeket-customer-${o.userId}` })

/** All of a customer's subscriptions, including ended ones. */
export const listSubscriptions = async (customerId: string) =>
  (await stripe<{ data: StripeSubscription[] }>(`subscriptions?status=all&limit=20&customer=${encodeURIComponent(customerId)}`)).data

/** Expire a customer's still-open Checkout pages, so only the newest one can be paid. */
export async function expireOpenCheckouts(customerId: string) {
  const open = await stripe<{ data: { id: string }[] }>(`checkout/sessions?status=open&limit=20&customer=${encodeURIComponent(customerId)}`)
  await Promise.all(open.data.map((s) => stripe(`checkout/sessions/${s.id}/expire`, new URLSearchParams())))
}

export const cancelSubscription = (id: string) => stripe<StripeSubscription>(`subscriptions/${encodeURIComponent(id)}`, undefined, { method: 'DELETE' })

/** Stripe's hosted page where a member updates their card or cancels. */
export const createPortalSession = (customerId: string, returnUrl: string) =>
  stripe<{ url: string }>('billing_portal/sessions', new URLSearchParams({ customer: customerId, return_url: returnUrl }))

/** A one-off payment for one ad. `successUrl` must contain {CHECKOUT_SESSION_ID}. */
export function createCheckoutSession(o: { listingId: string; name: string; amount: number; currency: string; email: string; successUrl: string; cancelUrl: string }) {
  return stripe<CheckoutSession>(
    'checkout/sessions',
    new URLSearchParams({
      mode: 'payment',
      client_reference_id: o.listingId,
      'metadata[listingId]': o.listingId,
      customer_email: o.email,
      success_url: o.successUrl,
      cancel_url: o.cancelUrl,
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': o.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': String(Math.round(o.amount * 100)),
      'line_items[0][price_data][product_data][name]': o.name,
    }),
  )
}

export const getCheckoutSession = (id: string) => stripe<CheckoutSession>(`checkout/sessions/${encodeURIComponent(id)}`)

/** Checks a `Stripe-Signature` header (t=…,v1=…) against the raw body. Returns the event, or null if it isn't genuine. */
export function verifyWebhook(payload: string, header: string | null, secret: string, toleranceSec = 300): { type: string; data: { object: CheckoutSession } } | null {
  if (!header) return null
  const parts = header.split(',').map((kv) => kv.split('=') as [string, string])
  const t = parts.find(([k]) => k === 't')?.[1]
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => Buffer.from(v ?? '', 'hex'))
  if (!t || !signatures.length || Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return null
  const expected = createHmac('sha256', secret).update(`${t}.${payload}`).digest()
  return signatures.some((s) => s.length === expected.length && timingSafeEqual(s, expected)) ? JSON.parse(payload) : null
}
