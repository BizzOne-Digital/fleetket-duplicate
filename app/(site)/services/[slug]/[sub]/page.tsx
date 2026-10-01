import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MapPin, UserRound } from 'lucide-react'
import { Breadcrumb, OffersBanner, TitleBand } from '@/components/live/blocks'
import { ServiceRequestForm } from '@/components/forms/live-forms'
import { JsonLd } from '@/components/site/json-ld'
import { getCategories, getCategory, getCategoryProviders, getPlan } from '@/lib/content'
import { absoluteUrl, buildMetadata } from '@/lib/seo'
import { offerFor } from '@/components/live/category'

export async function generateStaticParams() {
  return (await getCategories()).flatMap((c) => c.subServices.map((s) => ({ slug: c.slug, sub: s.slug })))
}

async function load(params: PageProps<'/services/[slug]/[sub]'>['params']) {
  const { slug, sub } = await params
  const category = await getCategory(slug)
  const subService = category?.subServices.find((s) => s.slug === sub)
  return category && subService ? { category, subService } : null
}

export async function generateMetadata({ params }: PageProps<'/services/[slug]/[sub]'>): Promise<Metadata> {
  const found = await load(params)
  if (!found) return {}
  const { category, subService } = found
  return buildMetadata({
    title: `${subService.name} — ${category.name} taskers`,
    description: subService.description || `Find ${subService.name.toLowerCase()} taskers on Fleeket.`,
    path: `/services/${category.slug}/${subService.slug}`,
    image: subService.image || undefined,
  })
}

export default async function SubServicePage({ params }: PageProps<'/services/[slug]/[sub]'>) {
  const found = await load(params)
  if (!found) notFound()
  const { category, subService } = found
  const [providers, plan] = await Promise.all([getCategoryProviders(category.slug, subService.slug), getPlan(category.plan)])
  const offer = await offerFor(plan)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: subService.name,
          serviceType: `${category.name} — ${subService.name}`,
          description: subService.description,
          url: absoluteUrl(`/services/${category.slug}/${subService.slug}`),
          provider: { '@id': absoluteUrl('/#organization') },
        }}
      />
      <TitleBand title={subService.name} body={subService.description} image={subService.image || category.image} />

      <section className="py-8">
        <div className="container-x grid gap-5">
          <Breadcrumb items={[{ label: category.name, href: `/services/${category.slug}` }, { label: subService.name, href: `/services/${category.slug}/${subService.slug}` }]} />

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-[1.25rem] font-bold text-ink">
                {providers.length} Service {providers.length === 1 ? 'Provider' : 'Providers'}
              </p>
              {providers.length ? (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {providers.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 rounded border border-line bg-white p-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-brand"><UserRound aria-hidden className="size-5" /></span>
                      <span>
                        <span className="block font-semibold text-ink">{p.name}</span>
                        {(p.city || p.region) && (
                          <span className="flex items-center gap-1 text-xs text-muted"><MapPin aria-hidden className="size-3.5" />{[p.city, p.region].filter(Boolean).join(', ')}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 rounded border border-line bg-panel px-6 py-8 text-center">
                  <p className="text-[1.125rem] font-bold text-ink">No Matches Found</p>
                  <p className="mt-1 text-muted">Your SubService has 0 Taskers — send a request below and we’ll find one for you.</p>
                </div>
              )}
            </div>

            <div className="rounded bg-panel p-5 shadow-[var(--shadow-card)]">
              <p className="text-[1.125rem] font-bold text-ink">Ready to make your choice? Let’s get started!</p>
              <p className="mb-4 mt-1">There are no fees for requesting information.</p>
              <ServiceRequestForm category={category.slug} subService={subService.slug} providers={providers.map(({ id, name, city, region }) => ({ id, name, city, region }))} />
            </div>
          </div>

          <div className="mt-4">
            <OffersBanner title={offer.title} subtitle={offer.subtitle} body={offer.body} />
          </div>
        </div>
      </section>
    </>
  )
}
