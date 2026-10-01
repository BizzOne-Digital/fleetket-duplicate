import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CtaBand, Eyebrow, PageHero } from '@/components/site/sections'
import { ServiceRequestForm } from '@/components/forms/lead-forms'
import { Reveal } from '@/components/motion'
import { Arrow, ButtonLink } from '@/components/ui/button'
import { CategoryIcon } from '@/components/category-icon'
import { getArea, getAreas, getCategories, getContent } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  return (await getAreas()).map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps<'/cities/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const a = await getArea(slug)
  if (!a) return {}
  return buildMetadata({
    title: a.seoTitle || `Find service providers in ${a.name}`,
    description: a.seoDescription || a.description.slice(0, 160),
    path: `/cities/${a.slug}`,
  })
}

export default async function AreaPage({ params }: PageProps<'/cities/[slug]'>) {
  const { slug } = await params
  const [area, categories, home, citiesPage] = await Promise.all([getArea(slug), getCategories(), getContent('home'), getContent('citiesPage')])
  if (!area) notFound()
  const highlighted = area.categories.length ? categories.filter((c) => area.categories.includes(c.slug)) : categories

  return (
    <>
      <PageHero
        eyebrow={`${area.country === 'CA' ? 'Canada' : 'United States'} · ${area.kind}`}
        heading={`Services in|${area.name}`}
        body={area.description}
        image={area.image || citiesPage.heroImage}
        crumbs={[{ label: 'Areas served', href: '/cities' }, { label: area.name, href: `/cities/${area.slug}` }]}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/services?area=${area.slug}`} size="lg" arrow>Browse services</ButtonLink>
          <ButtonLink href="#request" size="lg" variant="outline" className="text-cream">Request a provider</ButtonLink>
        </div>
      </PageHero>

      <section className="surface-light bg-cream py-24 text-forest-900 lg:py-32">
        <div className="container-x">
          <Reveal>
            <Eyebrow tone="light">Categories in {area.name}</Eyebrow>
            <h2 className="t-h2 mt-6 max-w-[18ch]">What can we help you find?</h2>
          </Reveal>
          <ul className="mt-14 grid border-t border-forest-900/15 sm:grid-cols-2 lg:grid-cols-3">
            {highlighted.map((c, i) => (
              <Reveal as="li" key={c.slug} delay={(i % 3) * 0.05} className="border-b border-forest-900/15 sm:odd:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0 sm:border-forest-900/15">
                <Link href={`/services/${c.slug}?area=${area.slug}`} className="group/btn group flex items-center gap-5 px-1 py-6 sm:px-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-sm border border-forest-900/15 text-moss transition-colors group-hover:border-moss group-hover:bg-moss group-hover:text-white">
                    <CategoryIcon name={c.icon} className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg font-semibold tracking-[-0.02em]">{c.name}</span>
                    <span className="block text-sm text-slate">{c.group}</span>
                  </span>
                  <span className="text-moss opacity-0 transition-opacity group-hover:opacity-100"><Arrow /></span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="request" className="grain relative scroll-mt-20 bg-forest-900 py-24 lg:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow>Need help in {area.name}?</Eyebrow>
            <h2 className="t-h2 mt-6 text-cream">Tell us what you need.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-fog">Describe the job and our team will help connect you with providers advertising in {area.name}.</p>
          </Reveal>
          <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
            <ServiceRequestForm tone="dark" categories={categories.map((c) => c.name)} defaultArea={area.name} />
          </Reveal>
        </div>
      </section>

      <CtaBand title={home.finalTitle} body={home.finalBody} />
    </>
  )
}
