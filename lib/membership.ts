import 'server-only'
import { revalidatePath } from 'next/cache'
import { isValidObjectId } from 'mongoose'
import { connectDb } from './db'
import { notifyAdmin } from './listing-service'
import { todayISO } from './listings'
import { Subscriber } from './models'
import { cancelSubscription, getSubscription, type StripeSubscription } from './stripe'

/** Stripe subscription status → the tasker's listing status (pending taskers stay pending until an admin approves them). */
const LISTING_STATUS: Record<string, string> = {
  active: 'active',
  trialing: 'trial',
  past_due: 'past-due',
  unpaid: 'past-due',
  paused: 'paused',
  canceled: 'cancelled',
  incomplete_expired: 'cancelled',
}
/** Subscriptions that still count as the member's current membership. */
export const CURRENT_MEMBERSHIP = ['active', 'trialing', 'past_due', 'unpaid', 'paused']

/** The tasker's membership row: the one carrying Stripe IDs if any (rows added later may not have them yet). */
type MembershipRow = { name: string; email: string; stripeCustomerId: string; stripeSubscriptionId: string; membershipStatus: string; freeUntil: string }
export const membershipRow = (userId: string) =>
  Subscriber.findOne({ userId }).sort('-stripeCustomerId -stripeSubscriptionId').lean<MembershipRow>()

/**
 * Copies a Stripe subscription onto every Subscriber row of the tasker who owns it (metadata.userId).
 * Called only from the Stripe webhook, with the subscription re-fetched from Stripe, so the order events arrive in
 * doesn't matter and replaying an event changes nothing (all fields are set to Stripe's current values).
 */
export async function syncMembership(sub: StripeSubscription) {
  const userId = sub.metadata?.userId
  if (!userId || !isValidObjectId(userId)) return
  await connectDb()
  const before = await membershipRow(userId)
  if (!before) return
  if (before.stripeSubscriptionId && before.stripeSubscriptionId !== sub.id) {
    // An old, ended subscription must not overwrite a newer one.
    if (!CURRENT_MEMBERSHIP.includes(sub.status)) return
    // A second live subscription for the same tasker (should never happen — checkout guards against it): keep the
    // one on file if Stripe confirms it's still live, cancel the newcomer and ask the admin to refund it.
    const existing = await getSubscription(before.stripeSubscriptionId)
    if (CURRENT_MEMBERSHIP.includes(existing.status)) {
      await cancelSubscription(sub.id)
      console.error(`[membership] cancelled duplicate subscription ${sub.id} for ${before.email} (keeps ${existing.id})`)
      await notifyAdmin(`Duplicate membership cancelled — refund needed — ${before.name}`, {
        Tasker: before.name,
        Email: before.email,
        Kept: `https://dashboard.stripe.com/subscriptions/${existing.id}`,
        Cancelled: `https://dashboard.stripe.com/subscriptions/${sub.id}`,
        Action: 'Refund any payment taken for the cancelled subscription in Stripe.',
      })
      return
    }
  }

  const periodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end
  const { modifiedCount } = await Subscriber.updateMany(
    { userId },
    {
      $set: {
        stripeCustomerId: sub.customer,
        stripeSubscriptionId: sub.id,
        membershipPlan: sub.metadata.plan ?? '',
        membershipStatus: sub.status,
        renewsOn: periodEnd ? todayISO(new Date(periodEnd * 1000)) : '',
        cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end || sub.cancel_at),
      },
    },
  )
  const status = LISTING_STATUS[sub.status]
  if (status) await Subscriber.updateMany({ userId, status: { $ne: 'pending' } }, { $set: { status } })
  revalidatePath('/', 'layout')

  // Only the delivery that actually changed something emails the admin — repeats and duplicates are no-ops.
  if (modifiedCount > 0 && (before.stripeSubscriptionId !== sub.id || before.membershipStatus !== sub.status)) {
    console.log(`[membership] ${before.email}: ${before.membershipStatus || 'none'} → ${sub.status} (${sub.id})`)
    await notifyAdmin(`Membership ${sub.status.replace('_', ' ')} — ${before.name}`, {
      Tasker: before.name,
      Email: before.email,
      Plan: sub.metadata.plan,
      Status: sub.status,
      [sub.cancel_at_period_end ? 'Ends on' : 'Renews on']: periodEnd ? todayISO(new Date(periodEnd * 1000)) : '',
      Stripe: `https://dashboard.stripe.com/subscriptions/${sub.id}`,
    })
  }
}
