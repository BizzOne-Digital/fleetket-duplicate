import Image from 'next/image'
import Link from 'next/link'
import { HandCoins, Handshake, LayoutGrid, UserRound } from 'lucide-react'
import { HeroSlider } from '@/components/live/hero-slider'
import { SearchBar } from '@/components/live/search-bar'
import { FaqSection } from '@/components/live/faq'
import { JsonLd } from '@/components/site/json-ld'
import { getAreas, getCategories, getContent, getFaqs } from '@/lib/content'
import { resolveImageSrc } from '@/lib/image'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('home', '/')

const STEP_ICONS = [UserRound, LayoutGrid, HandCoins, Handshake]

export default async function HomePage() {
  const [home, categories, areas, faqs] = await Promise.all([getContent('home'), getCategories(), getAreas(), getFaqs()])
  const faqItems = faqs.map((f) => ({ q: f.question, a: f.answer }))

  return (
    <>
      {faqItems.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }}
        />
      )}

      <HeroSlider slides={home.slides}>
        <SearchBar categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} areas={areas.map((a) => ({ name: a.name, slug: a.slug }))} />
      </HeroSlider>

      {/* Fleeket Services */}
      <section id="services" className="scroll-mt-16 py-8 sm:py-10">
        <div className="container-x">
          <h2 className="h-section">{home.servicesHeading}</h2>
          <ul className="mt-5 flex flex-wrap justify-center gap-x-[1.25%] gap-y-5">
            {categories.map((c) => (
              <li key={c.slug} className="w-full sm:w-[49%] md:w-[32.5%] lg:w-[23.9%]">
                <Link href={`/services/${c.slug}`} className="group block overflow-hidden rounded-sm bg-panel">
                  <span className="relative block aspect-[17/13] overflow-hidden">
                    <Image src={resolveImageSrc(c.image)} alt={c.imageAlt} fill sizes="(min-width: 1024px) 24vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </span>
                  <h3 className="py-2 text-center text-[1.0625rem] font-bold text-ink transition-colors group-hover:text-brand">{c.name}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Steps */}
      <section id="how-it-works" className="scroll-mt-16 bg-panel py-8 sm:py-10">
        <div className="container-x">
          <h2 className="h-section">{home.stepsHeading}</h2>
          <ol className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {home.steps.map((s, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length]
              return (
                <li key={s.title}>
                  <span className="grid size-[70px] place-items-center rounded-full bg-brand text-white">
                    <Icon aria-hidden className="size-8" strokeWidth={2} />
                  </span>
                  <h3 className="mt-3 text-[1.3125rem] font-bold text-ink">{s.title}</h3>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed">{s.body}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <div id="faq" className="scroll-mt-16">
        <FaqSection heading={home.faqHeading} bannerImage={home.faqBannerImage} bannerTitle={home.faqBannerTitle} bannerBody={home.faqBannerBody} items={faqItems} />
      </div>
    </>
  )
}
