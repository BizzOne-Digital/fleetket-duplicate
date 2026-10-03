import { NextResponse } from 'next/server'
import { confirmListingPayment } from '@/lib/listing-service'
import { verifyWebhook } from '@/lib/stripe'

export const runtime = 'nodejs'

/**
 * Stripe → checkout.session.completed. Backs up the return page, so an ad still goes live when the
 * buyer closes the tab before coming back. Add this URL in Stripe → Developers → Webhooks.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  const event = verifyWebhook(await req.text(), req.headers.get('stripe-signature'), secret)
  if (!event) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    try {
      await confirmListingPayment(event.data.object)
    } catch (err) {
      console.error('[stripe] webhook failed', err)
      return NextResponse.json({ error: 'Retry later' }, { status: 500 }) // Stripe retries
    }
  }
  return NextResponse.json({ received: true })
}
