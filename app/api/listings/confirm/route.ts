import { NextResponse, type NextRequest } from 'next/server'
import { confirmListingPayment } from '@/lib/listing-service'
import { getCheckoutSession, isStripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

/** Stripe Checkout's success_url: confirm the payment, then show the poster the result on the post-an-ad page. */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  const back = (category: string, done: string) => NextResponse.redirect(new URL(`/services/${category}/post?done=${done}`, req.url), 303)
  if (!sessionId || !/^cs_[\w]+$/.test(sessionId) || !isStripeConfigured) return NextResponse.redirect(new URL('/', req.url), 303)

  try {
    const listing = await confirmListingPayment(await getCheckoutSession(sessionId))
    if (!listing) return NextResponse.redirect(new URL('/contact', req.url), 303)
    return back(listing.category, listing.status === 'published' ? 'live' : listing.status === 'pending-review' ? 'review' : 'unpaid')
  } catch (err) {
    console.error('[stripe] confirm failed', err)
    return NextResponse.redirect(new URL('/contact', req.url), 303)
  }
}
