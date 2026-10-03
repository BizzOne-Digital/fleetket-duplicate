import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Stripe Checkout over its REST API — no SDK needed for one-off payments.
 * Uses the same Stripe account as the live fleeket.com: set STRIPE_SECRET_KEY (and STRIPE_WEBHOOK_SECRET
 * for the webhook at /api/stripe/webhook). Without a key, paid ads are saved as “awaiting payment” for the admin.
 */
export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY)

export type CheckoutSession = {
  id: string
  url: string | null
  payment_status: 'paid' | 'unpaid' | 'no_payment_required'
  client_reference_id: string | null
  amount_total: number | null
  currency: string | null
}

async function stripe<T>(path: string, body?: URLSearchParams): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body,
    cache: 'no-store',
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Stripe ${path}: ${json?.error?.message ?? res.status}`)
  return json as T
}

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
