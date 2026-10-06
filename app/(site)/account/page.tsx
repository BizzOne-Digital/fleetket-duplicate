import Link from 'next/link'
import { logout } from '@/app/actions/public'
import { openBillingPortal, startMembership } from '@/app/actions/membership'
import { requireUser } from '@/lib/auth'
import { db, formatPlanPrice, getCategories, getPlans } from '@/lib/content'
import { CURRENT_MEMBERSHIP } from '@/lib/membership'
import { isStripeConfigured } from '@/lib/stripe'
import { Subscriber } from '@/lib/models'
import { isAdminRole } from '@/lib/constants'
import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('My Account')

const STATUS_COPY: Record<string, string> = {
  pending: 'Awaiting approval — our team will review your profile shortly.',
  active: 'Live — customers can find and request you.',
  trial: 'Live (trial).',
  'past-due': 'Payment overdue — please contact us.',
  paused: 'Paused — not shown to customers.',
  cancelled: 'Cancelled.',
}

const MEMBERSHIP_NOTICE: Record<string, { ok: boolean; text: string }> = {
  success: { ok: true, text: 'Thank you — your membership is confirmed. It renews automatically until you cancel.' },
  processing: { ok: true, text: 'Thank you — we’re waiting for Stripe to confirm your payment. Your membership will show here within a minute; refresh this page to check.' },
  exists: { ok: true, text: 'You already have a membership. If it isn’t showing yet, refresh this page in a minute.' },
  cancelled: { ok: false, text: 'Checkout was cancelled — you have not been charged.' },
  unavailable: { ok: false, text: 'Online payments aren’t available right now. Please contact us.' },
  error: { ok: false, text: 'We couldn’t open the payment page just now. Please try again, or contact us.' },
}

const MEMBERSHIP_STATUS: Record<string, string> = {
  active: 'Active',
  trialing: 'Free period',
  past_due: 'Payment failed — please update your card',
  unpaid: 'Payment failed — please update your card',
  paused: 'Paused',
}

export default async function AccountPage({ searchParams }: PageProps<'/account'>) {
  const user = await requireUser('/account')
  const { welcome, denied, membership } = await searchParams

  const provider = user.role === 'provider'
  await db()
  const [listings, categories, plans] = provider ? await Promise.all([Subscriber.find({ userId: user.id }).lean(), getCategories(), getPlans()]) : [[], [], []]
  const member = listings.find((l) => l.stripeSubscriptionId) ?? listings.find((l) => l.stripeCustomerId) ?? listings[0]
  const current = member && CURRENT_MEMBERSHIP.includes(member.membershipStatus ?? '')
  // Back from Checkout: only say “confirmed” once the webhook has recorded it.
  const notice = MEMBERSHIP_NOTICE[membership === 'processing' && current ? 'success' : String(membership)]
  const memberPlans = plans.filter((p) => p.billing === 'subscription' && p.payer === 'provider' && p.amount > 0)
  const freeUntil = member?.freeUntil && member.freeUntil > new Date().toISOString().slice(0, 10) && !member.stripeSubscriptionId ? member.freeUntil : ''

  return (
    <section className="py-8">
      <div className="container-x max-w-4xl">
        {welcome && (
          <p role="status" className="mb-6 rounded border border-[#a3cfbb] bg-[#d1e7dd] px-4 py-3 text-[#0a3622]">
            {welcome === 'tasker' ? 'Welcome to Fleeket! Your tasker profile has been submitted for approval.' : 'Your account is ready. Welcome to Fleeket!'}
          </p>
        )}
        {notice && (
          <p role="status" className={notice.ok ? 'mb-6 rounded border border-[#a3cfbb] bg-[#d1e7dd] px-4 py-3 text-[#0a3622]' : 'mb-6 rounded border border-[#f1aeb5] bg-[#f8d7da] px-4 py-3 text-[#58151c]'}>{notice.text}</p>
        )}
        {denied && <p role="alert" className="mb-6 rounded border border-[#f1aeb5] bg-[#f8d7da] px-4 py-3 text-[#58151c]">You don’t have access to that area.</p>}

        <h1 className="text-[1.75rem] font-bold text-ink sm:text-[2rem]">Hello, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-muted">Signed in as {user.email} · <span className="capitalize">{user.role === 'provider' ? 'tasker' : user.role}</span> account</p>

        {provider && member && (current || (isStripeConfigured && memberPlans.length > 0)) && (
          <div className="mt-6 rounded bg-panel p-5">
            <h2 className="text-[1.25rem] font-bold text-ink">Membership</h2>
            {current ? (
              <>
                <p className="mt-1">
                  <span className="font-semibold text-ink">{plans.find((p) => p.slug === member.membershipPlan)?.name ?? 'Membership'}</span> · {MEMBERSHIP_STATUS[member.membershipStatus ?? ''] ?? member.membershipStatus}
                </p>
                {member.renewsOn && (
                  <p className="text-[0.8125rem] text-muted">
                    {member.cancelAtPeriodEnd ? `Cancelled — ends on ${member.renewsOn}.` : `${member.membershipStatus === 'trialing' ? 'First payment' : 'Renews automatically'} on ${member.renewsOn}.`}
                  </p>
                )}
                <form action={openBillingPortal} className="mt-4">
                  <button type="submit" className="rounded border border-brand px-5 py-2.5 text-brand hover:bg-brand hover:text-white">Manage payment or cancel</button>
                </form>
              </>
            ) : (
              <>
                <p className="mt-1">Choose a plan to keep your profile live. It renews automatically — cancel any time from this page.</p>
                {freeUntil && <p className="mt-1 text-[0.8125rem] font-semibold text-brand">Your promo code gives you free membership until {freeUntil} — you won’t be charged before then.</p>}
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {memberPlans.map((p) => (
                    <li key={p.slug} className="flex flex-col rounded border border-line bg-white p-4">
                      <p className="font-bold text-ink">{p.name}</p>
                      <p className="text-[1.125rem] font-bold text-brand">{formatPlanPrice(p)}</p>
                      {!freeUntil && !member.stripeSubscriptionId && p.trialDays > 0 && <p className="text-[0.8125rem] text-muted">{p.trialDays}-day free trial</p>}
                      {p.summary && <p className="mt-1 text-[0.8125rem]">{p.summary}</p>}
                      <form action={startMembership} className="mt-auto pt-3">
                        <input type="hidden" name="plan" value={p.slug} />
                        <button type="submit" className="w-full rounded bg-brand-light px-5 py-2.5 text-white hover:bg-brand">Subscribe</button>
                      </form>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {provider ? (
          <div className="mt-6 grid gap-3">
            <h2 className="text-[1.25rem] font-bold text-ink">Your skills</h2>
            {listings.length ? (
              listings.map((l) => {
                const c = categories.find((x) => x.slug === l.category)
                return (
                  <div key={String(l._id)} className="rounded border border-line bg-white p-4">
                    <p className="font-bold text-ink">{c?.name ?? l.category}</p>
                    <p className="text-[0.8125rem]">{(l.subServices ?? []).map((s) => c?.subServices.find((x) => x.slug === s)?.name ?? s).join(', ')}</p>
                    <p className="mt-2 text-[0.8125rem] font-semibold text-brand">{STATUS_COPY[l.status] ?? l.status}</p>
                  </div>
                )
              })
            ) : (
              <p className="text-muted">No skills on file yet. <Link href="/contact" className="text-brand underline">Contact us</Link> to add them.</p>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded bg-panel p-5">
            <h2 className="text-[1.25rem] font-bold text-ink">Find a tasker</h2>
            <p className="mt-1">Browse the services, choose a sub-service and send a request — there are no fees for requesting information.</p>
            <Link href="/#services" className="mt-4 inline-block rounded bg-brand-light px-5 py-2.5 text-white hover:bg-brand">Browse services</Link>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {isAdminRole(user.role) && <Link href="/admin" className="rounded bg-member px-5 py-2.5 text-white hover:bg-member-dark">Open admin dashboard</Link>}
          <form action={logout}>
            <button type="submit" className="rounded border border-brand px-5 py-2.5 text-brand hover:bg-brand hover:text-white">Sign out</button>
          </form>
          <Link href="/contact" className="text-[0.8125rem] text-muted hover:text-ink">Need help? Contact us</Link>
        </div>
      </div>
    </section>
  )
}
