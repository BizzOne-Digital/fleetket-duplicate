import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumb, TitleBand } from '@/components/live/blocks'
import { PricingPanel } from '@/components/live/listings'
import { ListingForm } from '@/components/forms/live-forms'
import { FormStatus } from '@/components/forms/fields'
import { getCategory, getPlan } from '@/lib/content'
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
  const { done } = await searchParams
  const category = await getCategory(slug)
  const plan = category ? await getPlan(category.plan) : null
  if (!category || plan?.billing !== 'listing') notFound()
  const result = typeof done === 'string' ? RESULTS[done] : undefined

  return (
    <>
      <TitleBand title={`Post an ad — ${category.name}`} body={category.description} />
      <section className="py-8">
        <div className="container-x grid gap-6">
          <Breadcrumb items={[{ label: category.name, href: `/services/${category.slug}` }, { label: 'Post an ad', href: `/services/${category.slug}/post` }]} />
          {result && <FormStatus state={result} />}
          {result?.ok ? (
            <Link href={`/services/${category.slug}`} className="justify-self-start rounded bg-brand-light px-5 py-2.5 text-white hover:bg-brand">See all {category.name} ads</Link>
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
              <ListingForm category={category.slug} plan={{ durations: plan.durations, currency: plan.currency, addressRequired: plan.addressRequired, requiresApproval: plan.requiresApproval }} />
              <PricingPanel plan={plan} />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
