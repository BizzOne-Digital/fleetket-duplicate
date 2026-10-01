import Image from 'next/image'
import { PageHero, CtaBand, Eyebrow } from '@/components/site/sections'
import { ImageReveal, Reveal } from '@/components/motion'
import { ButtonLink } from '@/components/ui/button'
import { ServiceSearch } from '@/components/site/service-search'
import { getAreas, getCategories, getContent, toSearchCategory } from '@/lib/content'
import { resolveImageSrc } from '@/lib/image'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('customers', '/for-customers')

export default async function ForCustomersPage() {
  const [page, home, categories, areas] = await Promise.all([getContent('customers'), getContent('home'), getCategories(), getAreas()])

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        body={page.body}
        crumbs={[{ label: 'For customers', href: '/for-customers' }]}
        image={page.image}
        imageAlt="Person searching for a service on a phone"
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/services" size="lg" arrow>Explore services</ButtonLink>
          <ButtonLink href="/register" size="lg" variant="outline" className="text-cream">Create an account</ButtonLink>
        </div>
      </PageHero>

      {/* The four-word journey */}
      <section className="surface-light bg-cream py-24 text-forest-900 lg:py-32">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <Eyebrow tone="light">Your journey</Eyebrow>
            <h2 className="t-h2 mt-6">Four steps. No guesswork.</h2>
          </Reveal>
          <ol className="mt-16 grid gap-y-14 border-t border-forest-900/15 pt-12 md:grid-cols-2 md:gap-x-16 lg:grid-cols-4 lg:gap-x-10">
            {page.steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08}>
                <span className="t-index text-moss">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 font-display text-[clamp(2.5rem,4vw,3.5rem)] font-semibold leading-none tracking-[-0.05em]">{s.title}</h3>
                <p className="mt-5 leading-relaxed text-slate">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Try it */}
      <section className="grain relative bg-forest-900 py-24 lg:py-32">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <Eyebrow>Start here</Eyebrow>
            <h2 className="t-h2 mt-6 text-cream">What do you need done?</h2>
          </Reveal>
          <Reveal className="relative z-20 mt-10" delay={0.1}>
            <ServiceSearch categories={categories.map(toSearchCategory)} areas={areas.map((a) => ({ name: a.name, slug: a.slug }))} />
          </Reveal>
        </div>
      </section>

      {/* Assurances */}
      <section className="surface-light bg-paper py-24 text-forest-900 lg:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:items-center">
          <ImageReveal className="relative aspect-[4/5] rounded-md lg:col-span-5">
            <Image src={resolveImageSrc(home.customersImage)} alt="Customer at home planning a project" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </ImageReveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <Eyebrow tone="light">What you can count on</Eyebrow>
              <h2 className="t-h2 mt-6 max-w-[14ch]">Simple, direct and fair.</h2>
            </Reveal>
            <ul className="mt-12 border-t border-forest-900/15">
              {page.assurances.map((a, i) => (
                <Reveal as="li" key={a.title} delay={i * 0.06} className="border-b border-forest-900/15 py-7">
                  <h3 className="t-h3">{a.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate">{a.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand title={home.finalTitle} body={home.finalBody} />
    </>
  )
}
