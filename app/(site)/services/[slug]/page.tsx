import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumb, OffersBanner, TitleBand } from '@/components/live/blocks'
import { SubServiceCard, offerFor } from '@/components/live/category'
import { JsonLd } from '@/components/site/json-ld'
import { getCategories, getCategory, getCategoryProviders, getPlan } from '@/lib/content'
import { absoluteUrl, buildMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/services/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const c = await getCategory(slug)
  if (!c) return {}
  return buildMetadata({
    title: c.seoTitle || `${c.name} services — find a tasker`,
    description: c.seoDescription || c.description.slice(0, 160),
    path: `/services/${c.slug}`,
    image: c.image.startsWith('https://') || c.image.startsWith('/api/') ? c.image : undefined,
  })
}

export default async function CategoryPage({ params }: PageProps<'/services/[slug]'>) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()
  const [providers, plan] = await Promise.all([getCategoryProviders(category.slug), getPlan(category.plan)])
  const offer = await offerFor(plan)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: category.name,
          serviceType: category.name,
          description: category.description,
          url: absoluteUrl(`/services/${category.slug}`),
          image: category.image || undefined,
          provider: { '@id': absoluteUrl('/#organization') },
          areaServed: [{ '@type': 'Country', name: 'Canada' }, { '@type': 'Country', name: 'United States' }],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `${category.name} services`,
            itemListElement: category.subServices.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: absoluteUrl(`/services/${category.slug}/${s.slug}`) } })),
          },
        }}
      />
      <TitleBand title={category.name} body={category.description} image={category.image} imageAlt={category.imageAlt} />

      <section className="py-8">
        <div className="container-x grid gap-5">
          <Breadcrumb items={[{ label: category.name, href: `/services/${category.slug}` }]} />
          {category.subServices.length ? (
            <ul className="flex flex-wrap justify-center gap-5">
              {category.subServices.map((s) => (
                <li key={s.slug} className="w-full md:w-[calc((100%-2.5rem)/3)]">
                  <SubServiceCard category={category} sub={s} count={providers.filter((p) => p.subServices.includes(s.slug)).length} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded border border-dashed border-line px-6 py-10 text-center text-muted">Services for this category are coming soon.</p>
          )}
          <div className="mt-4">
            <OffersBanner title={offer.title} subtitle={offer.subtitle} body={offer.body} />
          </div>
        </div>
      </section>
    </>
  )
}
