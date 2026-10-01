import Image from 'next/image'
import Link from 'next/link'
import { HomeHero } from '@/components/home/hero'
import { CategoryGallery } from '@/components/home/category-gallery'
import { Splash } from '@/components/site/splash'
import { CtaBand, Eyebrow } from '@/components/site/sections'
import { FaqList } from '@/components/site/faq-list'
import { ImageReveal, Parallax, Reveal, ScrollWords, SplitReveal } from '@/components/motion'
import { ButtonLink, TextLink } from '@/components/ui/button'
import { getAreas, getCategories, getContent, getFaqs, groupNames, toSearchCategory } from '@/lib/content'
import { CATEGORY_GROUPS } from '@/lib/constants'
import { resolveImageSrc } from '@/lib/image'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('home', '/')

export default async function HomePage() {
  const [home, how, pricing, categories, areas, faqs] = await Promise.all([
    getContent('home'),
    getContent('howItWorks'),
    getContent('pricing'),
    getCategories(),
    getAreas(),
    getFaqs(),
  ])

  const groups = [...new Set([...CATEGORY_GROUPS, ...groupNames(categories)])]
    .map((name) => {
      const items = categories.filter((c) => c.group === name)
      return { name, image: items[0]?.image ?? '', categories: items.map((c) => ({ name: c.name, slug: c.slug })) }
    })
    .filter((g) => g.categories.length)
  const [dollars, cents] = Number(pricing.amount).toFixed(2).split('.')

  return (
    <>
      <Splash />
      <HomeHero content={home} categories={categories.map(toSearchCategory)} areas={areas.map((a) => ({ name: a.name, slug: a.slug }))} />

      {/* Positioning — a calm beat after the hero */}
      <section className="bg-cream py-24 text-forest-900 lg:py-40">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <Eyebrow tone="light">What is Fleeket</Eyebrow>
          </Reveal>
          <div className="lg:col-span-9">
            <SplitReveal
              text="Fleeket connects people looking for services with the professionals ready to deliver them — directly, clearly, without the noise."
              className="font-display text-[clamp(2rem,4.2vw,4rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-balance"
            />
            <Reveal className="mt-12 flex flex-wrap gap-x-10 gap-y-4" delay={0.2}>
              <TextLink href="/how-it-works" className="text-forest-900">How it works</TextLink>
              <TextLink href="/about" className="text-forest-900">Why we built it</TextLink>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Two audiences */}
      <section className="border-t border-sage bg-paper py-24 text-forest-900 lg:py-36">
        <div className="container-x grid gap-16 md:grid-cols-2 md:gap-10 lg:gap-16">
          {[
            { title: home.customersTitle, body: home.customersBody, image: home.customersImage, label: 'For customers', href: '/for-customers', cta: 'How finding a provider works', alt: 'Customer arranging a service over the phone at home' },
            { title: home.providersTitle, body: home.providersBody, image: home.providersImage, label: 'For service providers', href: '/for-providers', cta: 'Advertise your service', alt: 'Shop owner in an apron checking orders on his phone' },
          ].map((p, i) => (
            <article key={p.label} className={i === 1 ? 'md:mt-40' : ''}>
              <ImageReveal className="relative aspect-[4/5] rounded-md" delay={i * 0.1}>
                <Parallax className="absolute inset-0" distance={50}>
                  <div className="relative size-full">
                    <Image src={resolveImageSrc(p.image)} alt={p.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                  </div>
                </Parallax>
                <span className="absolute left-5 top-5 rounded-sm bg-lime px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest-900">{p.label}</span>
              </ImageReveal>
              <Reveal className="mt-9" delay={0.1}>
                <h3 className="font-display text-[clamp(1.75rem,2.6vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-balance">{p.title}</h3>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-slate">{p.body}</p>
                <TextLink href={p.href} className="mt-7 text-forest-900">{p.cta}</TextLink>
              </Reveal>
            </article>
          ))}
        </div>
      </section>

      <CategoryGallery groups={groups} total={categories.length} />

      {/* How it works */}
      <section className="bg-cream py-24 text-forest-900 lg:py-36">
        <div className="container-x">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Reveal><Eyebrow tone="light">How it works</Eyebrow></Reveal>
              <SplitReveal text={how.heading} className="t-h2 mt-7 max-w-[17ch]" />
            </div>
            <Reveal delay={0.1}>
              <ButtonLink href="/how-it-works" variant="dark" arrow>See the full journey</ButtonLink>
            </Reveal>
          </div>
          <ol className="mt-16 border-t border-forest-900/15 lg:mt-24">
            {how.stages.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.06} className="group relative border-b border-forest-900/15">
                <span className="absolute inset-0 origin-left scale-x-0 bg-lime transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                <div className="relative grid gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-8 md:py-10">
                  <span className="font-display text-5xl font-semibold tracking-[-0.05em] text-forest-900/20 transition-colors duration-500 group-hover:text-forest-900 md:col-span-2 md:text-6xl">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-semibold tracking-[-0.03em] md:col-span-4">{s.title}</h3>
                  <p className="max-w-xl leading-relaxed text-slate transition-colors group-hover:text-forest-900 md:col-span-5">{s.body}</p>
                  <span className="hidden text-right md:col-span-1 md:block" aria-hidden>
                    <svg viewBox="0 0 16 16" className="ml-auto size-5 -rotate-45 transition-transform duration-500 group-hover:rotate-0" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Statement */}
      <section className="grain relative overflow-hidden bg-forest-950 py-28 lg:py-44">
        <div className="container-x">
          <Eyebrow>Why Fleeket</Eyebrow>
          <ScrollWords
            text={home.statement}
            className="mt-10 max-w-[22ch] font-display text-[clamp(2rem,4.8vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-cream"
          />
          <Reveal className="mt-12">
            <TextLink href="/about" className="text-lime">Read our story</TextLink>
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section className="overflow-hidden bg-paper py-24 text-forest-900 lg:py-36">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <Reveal><Eyebrow tone="light">{pricing.eyebrow}</Eyebrow></Reveal>
            <div className="mt-8 flex items-start font-display font-semibold leading-[0.8] tracking-[-0.065em]" role="img" aria-label={`$${dollars}.${cents}`}>
              <span aria-hidden className="mt-[0.12em] text-[clamp(2.5rem,5vw,5rem)] text-forest-900/40">$</span>
              <SplitReveal as="p" text={dollars} className="text-[clamp(9rem,22vw,19rem)]" />
              <span aria-hidden className="mt-[0.12em] text-[clamp(2.5rem,5vw,5rem)]">.{cents}</span>
            </div>
            <Reveal className="mt-6 inline-flex items-center gap-3 rounded-sm bg-lime px-4 py-2 text-sm font-medium" delay={0.3}>
              {pricing.unit}{pricing.currency ? ` · ${pricing.currency}` : ''}
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <SplitReveal text={pricing.heading} className="t-h2 max-w-[14ch]" />
            <Reveal delay={0.1}>
              <p className="mt-5 leading-relaxed text-slate">{pricing.body}</p>
              <ul className="mt-8 border-t border-forest-900/15">
                {pricing.includes.slice(0, 3).map((item) => (
                  <li key={item} className="flex gap-4 border-b border-forest-900/15 py-4">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-lime">
                      <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M3 8.5l3 3 7-7" /></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/pricing" variant="dark" className="mt-9" arrow>See pricing</ButtonLink>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Areas served */}
      <section className="grain relative bg-forest-900 py-24 lg:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal><Eyebrow>Areas served</Eyebrow></Reveal>
            <SplitReveal text="Coast to coast to coast." className="t-h2 mt-7 text-cream" />
            <Reveal delay={0.15}>
              <p className="mt-5 max-w-sm leading-relaxed text-fog">Every Canadian province and territory, with the platform built from day one to welcome U.S. markets.</p>
              <TextLink href="/cities" className="mt-8 text-lime">View all areas</TextLink>
            </Reveal>
          </div>
          <ul className="grid grid-cols-1 border-t border-cream/10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            {areas.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={(i % 3) * 0.05} className="border-b border-cream/10">
                <Link href={`/cities/${a.slug}`} className="group flex items-center justify-between gap-4 py-5 pr-4">
                  <span className="text-mist transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5 group-hover:text-lime">{a.name}</span>
                  <span className="t-index text-haze transition-colors group-hover:text-lime">{a.regionCode}</span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="bg-cream py-24 text-forest-900 lg:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal><Eyebrow tone="light">Questions</Eyebrow></Reveal>
            <SplitReveal text="Good to know." className="t-h2 mt-7" />
            <Reveal delay={0.1}><TextLink href="/faq" className="mt-8 text-forest-900">All questions</TextLink></Reveal>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqs.slice(0, 5).map((f) => ({ q: f.question, a: f.answer }))} />
          </div>
        </div>
      </section>

      <CtaBand title={home.finalTitle} body={home.finalBody} />
    </>
  )
}
