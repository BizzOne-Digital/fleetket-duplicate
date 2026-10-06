import { NextResponse } from 'next/server'
import { confirmListingPayment } from '@/lib/listing-service'
import { syncMembership } from '@/lib/membership'
import { getSubscription, verifyWebhook } from '@/lib/stripe'

export const runtime = 'nodejs'

/**
 * Stripe → this URL (Developers → Webhooks). Backs up the return pages, so an ad still goes live and a membership
 * is still recorded when the buyer closes the tab, and keeps memberships in step with renewals, failed payments
 * and cancellations. Subscriptions are re-fetched, so events arriving out of order can't leave a stale status.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  const event = verifyWebhook(await req.text(), req.headers.get('stripe-signature'), secret)
  if (!event) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

  const o = event.data.object
  const subscriptionId = event.type.startsWith('customer.subscription.') ? o.id : o.mode === 'subscription' ? o.subscription : null
  if (subscriptionId || event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    try {
      if (subscriptionId) await syncMembership(await getSubscription(subscriptionId))
      else await confirmListingPayment(o)
    } catch (err) {
      console.error('[stripe] webhook failed', err)
      return NextResponse.json({ error: 'Retry later' }, { status: 500 }) // Stripe retries
    }
  }
  return NextResponse.json({ received: true })
}
