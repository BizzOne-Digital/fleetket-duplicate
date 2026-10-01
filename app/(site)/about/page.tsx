import Image from 'next/image'
import { PageHero, CtaBand, Eyebrow, NumberedList } from '@/components/site/sections'
import { ImageReveal, Reveal, SplitReveal } from '@/components/motion'
import { getContent } from '@/lib/content'
import { resolveImageSrc } from '@/lib/image'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('about', '/about')

export default async function AboutPage() {
  const [page, home, site] = await Promise.all([getContent('about'), getContent('home'), getContent('site')])

  return (
    <>
      <PageHero eyebrow={page.eyebrow} heading={page.heading} crumbs={[{ label: 'About', href: '/about' }]} image={page.image} imageAlt="Storefront window with a sign thanking customers for supporting local" />

      {/* Intro */}
      <section className="bg-cream py-24 text-forest-900 lg:py-36">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <Eyebrow tone="light">Who we are</Eyebrow>
          </Reveal>
          <div className="lg:col-span-9">
            <SplitReveal text={page.intro} className="font-display text-[clamp(1.75rem,3.4vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-balance" />
            <Reveal className="mt-12 inline-flex items-center gap-4 rounded-sm bg-lime px-5 py-3 font-display text-lg font-semibold tracking-[-0.02em]" delay={0.2}>
              “{site.tagline}.”
            </Reveal>
          </div>
        </div>
      </section>

      {/* Problem / approach */}
      <section className="border-t border-sage bg-paper py-24 text-forest-900 lg:py-36">
        <div className="container-x grid gap-20 lg:grid-cols-2 lg:gap-24">
          {[
            { title: page.problemTitle, body: page.problemBody, n: '01' },
            { title: page.approachTitle, body: page.approachBody, n: '02' },
          ].map((b, i) => (
            <Reveal key={b.n} delay={i * 0.1} className={i === 1 ? 'lg:mt-40' : ''}>
              <div className="flex items-center gap-4">
                <span className="t-index text-moss">{b.n}</span>
                <span className="h-px flex-1 bg-forest-900/15" />
              </div>
              <h2 className="t-h2 mt-8">{b.title}</h2>
              <p className="mt-6 text-lg leading-relaxed text-slate text-pretty">{b.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="grain relative bg-forest-900 py-24 lg:py-32">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <Eyebrow>What guides us</Eyebrow>
            <h2 className="t-h2 mt-6 text-cream">Principles, not slogans.</h2>
          </Reveal>
          <div className="mt-16">
            <NumberedList items={page.principles} />
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="surface-light bg-paper py-24 text-forest-900 lg:py-36">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:items-center">
          <ImageReveal className="relative aspect-[4/5] rounded-md lg:col-span-5">
            <Image src={resolveImageSrc(page.secondaryImage)} alt="Independent business owner at her counter" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </ImageReveal>
          <Reveal className="lg:col-span-6 lg:col-start-7">
            <Eyebrow tone="light">{page.visionTitle}</Eyebrow>
            <p className="mt-8 font-display text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-pretty">{page.visionBody}</p>
          </Reveal>
        </div>
      </section>

      <CtaBand title={home.finalTitle} body={home.finalBody} />
    </>
  )
}
