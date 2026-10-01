import Link from 'next/link'
import { logout } from '@/app/actions/public'
import { requireUser } from '@/lib/auth'
import { db, getCategories } from '@/lib/content'
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

export default async function AccountPage({ searchParams }: PageProps<'/account'>) {
  const user = await requireUser('/account')
  const { welcome, denied } = await searchParams
  const provider = user.role === 'provider'
  await db()
  const [listings, categories] = provider ? await Promise.all([Subscriber.find({ userId: user.id }).lean(), getCategories()]) : [[], []]

  return (
    <section className="py-8">
      <div className="container-x max-w-4xl">
        {welcome && (
          <p role="status" className="mb-6 rounded border border-[#a3cfbb] bg-[#d1e7dd] px-4 py-3 text-[#0a3622]">
            {welcome === 'tasker' ? 'Welcome to Fleeket! Your tasker profile has been submitted for approval.' : 'Your account is ready. Welcome to Fleeket!'}
          </p>
        )}
        {denied && <p role="alert" className="mb-6 rounded border border-[#f1aeb5] bg-[#f8d7da] px-4 py-3 text-[#58151c]">You don’t have access to that area.</p>}

        <h1 className="text-[1.75rem] font-bold text-ink sm:text-[2rem]">Hello, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-muted">Signed in as {user.email} · <span className="capitalize">{user.role === 'provider' ? 'tasker' : user.role}</span> account</p>

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
