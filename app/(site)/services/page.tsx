import Image from 'next/image'
import Link from 'next/link'
import { PageHero, CtaBand, Eyebrow } from '@/components/site/sections'
import { ServicesExplorer } from '@/components/services/explorer'
import { JsonLd } from '@/components/site/json-ld'
import { Reveal, SplitReveal } from '@/components/motion'
import { CategoryIcon } from '@/components/category-icon'
import { getAreas, getCategories, getContent, groupNames, toSearchCategory } from '@/lib/content'
import { CATEGORY_GROUPS } from '@/lib/constants'
import { resolveImageSrc } from '@/lib/image'
import { absoluteUrl, generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('servicesPage', '/services')

export default async function ServicesPage() {
  const [page, home, categories, areas] = await Promise.all([getContent('servicesPage'), getContent('home'), getCategories(), getAreas()])
  const groups = [...new Set([...CATEGORY_GROUPS, ...groupNames(categories)])].filter((g) => categories.some((c) => c.group === g))
  const featured = categories.filter((c) => c.featured)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Fleeket service categories',
          itemListElement: categories.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, url: absoluteUrl(`/services/${c.slug}`) })),
        }}
      />
      <PageHero eyebrow={page.eyebrow} heading={page.heading} body={page.body} image={page.heroImage} crumbs={[{ label: 'Services', href: '/services' }]} />

      {/* Featured rail */}
      {featured.length > 0 && (
        <section className="overflow-hidden bg-forest-900 py-20 lg:py-24">
          <div className="container-x flex items-end justify-between gap-6">
            <div>
              <Reveal><Eyebrow>Most requested</Eyebrow></Reveal>
              <SplitReveal text="Popular right now" className="t-h2 mt-6 text-cream" />
            </div>
            <Reveal className="hidden text-sm text-fog md:block">Swipe or scroll →</Reveal>
          </div>
          <ul className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] pb-2 [scroll-padding-inline:var(--gutter)]">
            {featured.map((c, i) => (
              <Reveal as="li" key={c.slug} delay={Math.min(i, 5) * 0.06} className="w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-[27vw]">
                <Link href={`/services/${c.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                    <Image src={resolveImageSrc(c.image)} alt="" fill sizes="(min-width: 1024px) 27vw, 78vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.08]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/20 to-transparent" />
                    <span className="absolute left-5 top-5 grid size-11 place-items-center rounded-full bg-lime text-forest-900 transition-transform duration-500 group-hover:rotate-12">
                      <CategoryIcon name={c.icon} className="size-5" />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lime">{c.group}</p>
                      <h3 className="mt-2 font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-cream">{c.name}</h3>
                      <p className="mt-2 grid grid-rows-[0fr] text-sm leading-relaxed text-cream/80 opacity-0 transition-all duration-500 group-hover:grid-rows-[1fr] group-hover:opacity-100">
                        <span className="overflow-hidden">{c.shortDescription}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* Directory */}
      <section className="overflow-x-clip bg-cream pb-28 pt-16 text-forest-900 lg:pb-36 lg:pt-20">
        <div className="container-x">
          <div className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Reveal><Eyebrow tone="light">The directory</Eyebrow></Reveal>
              <SplitReveal text={`All ${categories.length} categories, one search away.`} className="t-h2 mt-6 max-w-[16ch]" />
            </div>
            <Reveal className="text-slate lg:col-span-4 lg:col-start-9" delay={0.1}>
              Can’t see what you need? Describe it in the search — we match service types, not just category names.
            </Reveal>
          </div>
          <ServicesExplorer categories={categories.map(toSearchCategory)} groups={groups} areas={areas.map((a) => ({ name: a.name, slug: a.slug }))} />
        </div>
      </section>

      <CtaBand title={home.finalTitle} body={home.finalBody} />
    </>
  )
}
