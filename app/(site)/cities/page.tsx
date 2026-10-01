import Link from 'next/link'
import { PageHero, CtaBand, Eyebrow } from '@/components/site/sections'
import { Reveal } from '@/components/motion'
import { TextLink } from '@/components/ui/button'
import { getAreas, getContent, type Area } from '@/lib/content'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('citiesPage', '/cities')

function AreaRows({ areas }: { areas: Area[] }) {
  return (
    <ul className="border-t border-white/10">
      {areas.map((a, i) => (
        <Reveal as="li" key={a.slug} delay={Math.min(i, 8) * 0.03} className="border-b border-white/10">
          <Link href={`/cities/${a.slug}`} className="group/btn group grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 py-6 sm:grid-cols-[5rem_1fr_auto] md:py-7">
            <span className="t-index text-haze transition-colors group-hover:text-lime">{a.regionCode}</span>
            <span className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-semibold tracking-[-0.035em] text-mist transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 group-hover:text-cream">
              {a.name}
            </span>
            <span className="hidden text-sm capitalize text-haze sm:block">{a.kind}</span>
          </Link>
        </Reveal>
      ))}
    </ul>
  )
}

export default async function CitiesPage() {
  const [page, home, areas] = await Promise.all([getContent('citiesPage'), getContent('home'), getAreas()])
  const canada = areas.filter((a) => a.country === 'CA')
  const us = areas.filter((a) => a.country === 'US')

  return (
    <>
      <PageHero eyebrow={page.eyebrow} heading={page.heading} body={page.body} crumbs={[{ label: 'Areas served', href: '/cities' }]} image={page.heroImage} />

      <section className="bg-forest-900 pb-24 lg:pb-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <Eyebrow>Canada</Eyebrow>
            <p className="mt-4 text-sm text-fog">{canada.length} provinces and territories</p>
          </Reveal>
          <div className="lg:col-span-9">
            <AreaRows areas={canada} />
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.07] bg-forest-950 py-24 lg:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <Eyebrow>United States</Eyebrow>
          </Reveal>
          <div className="lg:col-span-9">
            {us.length ? (
              <AreaRows areas={us} />
            ) : (
              <Reveal>
                <h2 className="t-h2 max-w-[18ch] text-cream">Preparing for U.S. markets.</h2>
                <p className="mt-5 max-w-xl leading-relaxed text-fog">
                  Fleeket is built to serve communities across the United States. If you’re a provider or partner interested in an upcoming U.S. market, we’d like to hear from you.
                </p>
                <TextLink href="/contact" className="mt-8 text-cream">Contact Fleeket</TextLink>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <CtaBand title={home.finalTitle} body={home.finalBody} />
    </>
  )
}
