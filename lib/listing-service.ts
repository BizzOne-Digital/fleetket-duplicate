import 'server-only'
import { revalidatePath } from 'next/cache'
import { isValidObjectId } from 'mongoose'
import { connectDb } from './db'
import { getContent } from './content'
import { sendEmail } from './email'
import { Category, Listing, Plan } from './models'
import { getSiteUrl } from './seo'
import type { CheckoutSession } from './stripe'

/** Email the site's notification address (Admin → Site settings). */
export async function notifyAdmin(subject: string, fields: Record<string, string | undefined>, replyTo?: string) {
  const site = await getContent('site')
  const to = site.notifyEmail || site.contactEmail
  if (!to) return
  const text = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  await sendEmail({ to, subject, text, replyTo })
}

type ListingLike = { _id: unknown; title: string; category: string; email?: string | null; contactName?: string | null; startDate: string; endDate: string; city?: string | null; amount?: number | null }

export const adminListingUrl = (id: unknown) => `${getSiteUrl()}/admin/listings/${String(id)}`

/** Tells the poster their ad is live. */
export async function emailListingLive(l: ListingLike) {
  if (!l.email) return
  await sendEmail({
    to: l.email,
    subject: `Your Fleeket ad is live — ${l.title}`,
    text: [
      `Hi ${l.contactName || 'there'},`,
      '',
      `Your ad “${l.title}” is now live on Fleeket from ${l.startDate} to ${l.endDate}.`,
      `See it here: ${getSiteUrl()}/services/${l.category}`,
      '',
      'Thank you for using Fleeket.',
    ].join('\n'),
  })
}

/**
 * Marks an ad paid after Stripe confirms the Checkout session — from the return page or the webhook,
 * whichever arrives first. Idempotent: only an ad still awaiting payment changes.
 */
export async function confirmListingPayment(session: CheckoutSession) {
  const id = session.client_reference_id
  if (session.payment_status !== 'paid' || !id || !isValidObjectId(id)) return null
  await connectDb()
  const listing = await Listing.findById(id).lean()
  if (!listing) return null
  if (listing.paymentRef === session.id) return listing // already confirmed
  if (session.amount_total !== Math.round((listing.amount ?? 0) * 100)) {
    console.error('[stripe] amount mismatch for listing', id, session.amount_total)
    return null
  }

  const category = await Category.findOne({ slug: listing.category }).select('plan').lean()
  const plan = category?.plan ? await Plan.findOne({ slug: category.plan }).select('requiresApproval').lean() : null
  const status = plan?.requiresApproval ? 'pending-review' : 'published'
  const updated = await Listing.findOneAndUpdate(
    { _id: id, status: 'awaiting-payment' },
    { $set: { status, paymentRef: session.id, paidAt: new Date() } },
    { new: true },
  ).lean()
  if (!updated) return Listing.findById(id).lean() // the other path got there first

  revalidatePath(`/services/${updated.category}`)
  await notifyAdmin(
    `${status === 'published' ? 'New paid ad is live' : 'Paid ad awaiting approval'} — ${updated.title}`,
    { Ad: updated.title, Category: updated.category, Dates: `${updated.startDate} → ${updated.endDate}`, City: updated.city ?? '', Paid: `$${(updated.amount ?? 0).toFixed(2)} ${updated.currency}`, Contact: `${updated.contactName} <${updated.email}>`, Admin: adminListingUrl(updated._id) },
    updated.email ?? undefined,
  )
  if (status === 'published') await emailListingLive(updated)
  return updated
}
