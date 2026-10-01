import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Eyebrow, PageHero } from '@/components/site/sections'
import { FaqList } from '@/components/site/faq-list'
import { JsonLd } from '@/components/site/json-ld'
import { ServiceRequestForm } from '@/components/forms/lead-forms'
import { ImageReveal, Reveal } from '@/components/motion'
import { ButtonLink, TextLink, Arrow } from '@/components/ui/button'
import { formatPrice, getCategories, getCategory, getContent } from '@/lib/content'
import { resolveImageSrc } from '@/lib/image'
import { absoluteUrl, buildMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/services/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const c = await getCategory(slug)
  if (!c) return {}
  return buildMetadata({
    title: c.seoTitle || `${c.name} services — find a provider`,
    description: c.seoDescription || c.shortDescription,
    path: `/services/${c.slug}`,
    image: c.image.startsWith('https://') || c.image.startsWith('/api/') ? c.image : undefined,
  })
}

export default async function CategoryPage({ params }: PageProps<'/services/[slug]'>) {
  const { slug } = await params
  const [category, categories, pricing] = await Promise.all([getCategory(slug), getCategories(), getContent('pricing')])
  if (!category) notFound()

  const related = categories.filter((c) => c.group === category.group && c.slug !== category.slug).slice(0, 3)
  const fill = categories.filter((c) => c.slug !== category.slug && !related.includes(c)).slice(0, 3 - related.length)
  const relatedAll = [...related, ...fill]
  const url = absoluteUrl(`/services/${category.slug}`)

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: category.name,
            serviceType: category.name,
            description: category.description || category.shortDescription,
            url,
            image: category.image || undefined,
            provider: { '@id': absoluteUrl('/#organization') },
            areaServed: [{ '@type': 'Country', name: 'Canada' }, { '@type': 'Country', name: 'United States' }],
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: `${category.name} services`,
              itemListElement: category.serviceTypes.map((t) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t } })),
            },
          },
          ...(category.faqs.length
            ? [{
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: category.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
              }]
            : []),
        ]}
      />

      {/* Hero */}
      <PageHero
        eyebrow={category.group}
        heading={category.name}
        body={category.shortDescription}
        image={category.image}
        imageAlt={category.imageAlt || category.name}
        crumbs={[{ label: 'Services', href: '/services' }, { label: category.name, href: `/services/${category.slug}` }]}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#request" size="lg" arrow>Request a provider</ButtonLink>
          <ButtonLink href={`/for-providers?category=${category.slug}#list`} size="lg" variant="outline" className="text-cream">I offer this service</ButtonLink>
        </div>
      </PageHero>

      {/* Overview + needs */}
      <section className="surface-light bg-cream py-24 text-forest-900 lg:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow tone="light">Overview</Eyebrow>
            <p className="mt-8 font-display text-[clamp(1.5rem,2.4vw,2.125rem)] font-medium leading-[1.25] tracking-[-0.025em] text-pretty">
              {category.description}
            </p>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <h2 className="t-eyebrow text-slate">Common reasons people search</h2>
            </Reveal>
            <ol className="mt-6 border-t border-forest-900/15">
              {category.needs.map((n, i) => (
                <Reveal as="li" key={n} delay={i * 0.05} className="flex gap-6 border-b border-forest-900/15 py-5">
                  <span className="t-index pt-1 text-moss">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-lg">{n}</span>
                </Reveal>
              ))}
            </ol>
            {category.serviceTypes.length > 0 && (
              <Reveal className="mt-12">
                <h2 className="t-eyebrow text-slate">Related service types</h2>
                <p className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-display text-xl font-medium tracking-[-0.02em] text-forest-900">
                  {category.serviceTypes.map((t, i) => (
                    <span key={t} className="flex items-center gap-3">
                      {t}
                      {i < category.serviceTypes.length - 1 && <span aria-hidden className="text-pebble">/</span>}
                    </span>
                  ))}
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Dual conversion */}
      <section id="request" className="grain relative scroll-mt-20 bg-forest-900 py-24 lg:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>Need {category.name.toLowerCase()}?</Eyebrow>
              <h2 className="t-h2 mt-6 text-cream">Tell us about the job.</h2>
              <p className="mt-5 max-w-md leading-relaxed text-fog">
                Share a few details and our team will help connect you with {category.name.toLowerCase()} providers who advertise in your area.
                Browsing is free — connecting with a provider is a flat {formatPrice(pricing)}.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-12 rounded-md border border-white/10 p-7">
              <p className="t-eyebrow text-haze">Offer {category.name.toLowerCase()}?</p>
              <p className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-cream">Get discovered by people searching for exactly what you do.</p>
              <TextLink href={`/for-providers?category=${category.slug}#list`} className="mt-5 text-lime">List your service</TextLink>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
            <ServiceRequestForm tone="dark" categories={categories.map((c) => c.name)} defaultCategory={category.name} />
          </Reveal>
        </div>
      </section>

      {/* FAQs */}
      {category.faqs.length > 0 && (
        <section className="surface-light bg-paper py-24 text-forest-900 lg:py-32">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <Eyebrow tone="light">Questions</Eyebrow>
              <h2 className="t-h2 mt-6">{category.name}, answered.</h2>
            </Reveal>
            <div className="lg:col-span-8">
              <FaqList items={category.faqs} />
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      <section className="bg-forest-900 py-24 lg:py-32">
        <div className="container-x">
          <div className="flex items-end justify-between gap-6">
            <Reveal>
              <Eyebrow>Related categories</Eyebrow>
              <h2 className="t-h2 mt-6 text-cream">You might also need</h2>
            </Reveal>
            <Reveal className="hidden sm:block">
              <TextLink href="/services" className="text-cream">All services</TextLink>
            </Reveal>
          </div>
          <ul className="mt-14 grid gap-5 md:grid-cols-3">
            {relatedAll.map((c, i) => (
              <li key={c.slug}>
                <Link href={`/services/${c.slug}`} className="group/btn group block">
                  <ImageReveal className="relative aspect-[4/3] rounded-md" delay={i * 0.08}>
                    <Image src={resolveImageSrc(c.image)} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                  </ImageReveal>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <h3 className="t-h3 text-cream">{c.name}</h3>
                    <span className="text-lime"><Arrow /></span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-fog">{c.shortDescription}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
