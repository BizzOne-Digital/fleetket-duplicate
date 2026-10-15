import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumb, TitleBand } from '@/components/live/blocks'
import { PricingPanel } from '@/components/live/listings'
import { ListingForm } from '@/components/forms/live-forms'
import { FormStatus } from '@/components/forms/fields'
import { db, getCategory, getPlan } from '@/lib/content'
import { getCurrentUser } from '@/lib/auth'
import { Listing } from '@/lib/models'
import { isValidObjectId } from 'mongoose'
import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Post an ad')

const RESULTS: Record<string, { ok: boolean; message: string }> = {
  live: { ok: true, message: 'Payment received — your ad is live. We’ve emailed you a confirmation.' },
  review: { ok: true, message: 'Payment received. Our team will check your ad and email you as soon as it’s live.' },
  cancelled: { ok: false, message: 'Payment cancelled — your ad hasn’t been posted. You can try again below.' },
  unpaid: { ok: false, message: 'We couldn’t confirm your payment yet. If you were charged, please contact us and we’ll sort it out.' },
}

export default async function PostAdPage({ params, searchParams }: PageProps<'/services/[slug]/post'>) {
  const { slug } = await params
  const { done, edit } = await searchParams
  const category = await getCategory(slug)
  const plan = category ? await getPlan(category.plan) : null
  if (!category || plan?.billing !== 'listing') notFound()
  const result = typeof done === 'string' ? RESULTS[done] : undefined
  const user = await getCurrentUser()
  let ad
  if (typeof edit === 'string') {
    if (!user || !isValidObjectId(edit)) notFound()
    await db()
    const l = await Listing.findOne({ _id: edit, userId: user.id, category: slug, status: { $ne: 'cancelled' } }).lean()
    if (!l) notFound()
    ad = { id: String(l._id), title: l.title, description: l.description, startDate: l.startDate, endDate: l.endDate, address: l.address, city: l.city, region: l.region, postalCode: l.postalCode, contactName: l.contactName, email: l.email, phone: l.phone }
  }
  const verb = ad ? 'Edit your ad' : 'Post an ad'

  return (
    <>
      <TitleBand title={`${verb} — ${category.name}`} body={category.description} />
      <section className="py-8">
        <div className="container-x grid gap-6">
          <Breadcrumb items={[{ label: category.name, href: `/services/${category.slug}` }, { label: verb, href: `/services/${category.slug}/post` }]} />
          {result && <FormStatus state={result} />}
          {!user && !ad && !result?.ok && (
            <p className="text-[0.9375rem]">
              <Link href={`/login?next=${encodeURIComponent(`/services/${category.slug}/post`)}`} className="text-brand underline">Sign in</Link> first to keep all your ads together on your account, where you can edit or take them down any time.
            </p>
          )}
          {result?.ok ? (
            <div className="flex flex-wrap gap-3">
            <Link href={`/services/${category.slug}`} className="justify-self-start rounded bg-brand-light px-5 py-2.5 text-white hover:bg-brand">See all {category.name} ads</Link>
              <Link href={`/services/${category.slug}/post`} className="rounded border border-brand px-5 py-2.5 text-brand hover:bg-brand hover:text-white">Post another ad</Link>
              {user && <Link href="/account#ads" className="rounded border border-brand px-5 py-2.5 text-brand hover:bg-brand hover:text-white">My ads</Link>}
            </div>
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
              <ListingForm key={ad?.id ?? 'new'} ad={ad} defaults={user ? { contactName: user.name, email: user.email } : undefined} category={category.slug} plan={{ durations: plan.durations, currency: plan.currency, addressRequired: plan.addressRequired, requiresApproval: plan.requiresApproval }} />
              <PricingPanel plan={plan} />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
