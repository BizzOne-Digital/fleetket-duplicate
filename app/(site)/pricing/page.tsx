import { PageHero, CtaBand, Eyebrow } from '@/components/site/sections'
import { FaqList } from '@/components/site/faq-list'
import { JsonLd } from '@/components/site/json-ld'
import { Reveal } from '@/components/motion'
import { ButtonLink, TextLink } from '@/components/ui/button'
import { formatPrice, getContent, getFaqs } from '@/lib/content'
import { absoluteUrl, generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('pricing', '/pricing')

export default async function PricingPage() {
  const [pricing, faqs, home] = await Promise.all([getContent('pricing'), getFaqs(), getContent('home')])
  const pricingFaqs = faqs.filter((f) => f.topic === 'Pricing & payments')
  const [dollars, cents] = Number(pricing.amount).toFixed(2).split('.')

  return (
    <>
      {pricing.currency && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Offer',
            name: 'Fleeket provider connection',
            description: pricing.body,
            price: Number(pricing.amount).toFixed(2),
            priceCurrency: pricing.currency,
            url: absoluteUrl('/pricing'),
            seller: { '@id': absoluteUrl('/#organization') },
          }}
        />
      )}
      <PageHero
        eyebrow={pricing.eyebrow}
        heading={pricing.heading}
        body={pricing.body}
        crumbs={[{ label: 'Pricing', href: '/pricing' }]}
        image={pricing.heroImage}
        aside={
          <div className="relative overflow-hidden rounded-md border border-white/10 bg-forest-850/80 p-8 backdrop-blur-xl lg:p-10">
            <p className="t-eyebrow text-haze">One connection</p>
            <p className="mt-6 flex items-start font-display font-semibold leading-none tracking-[-0.06em] text-cream">
              <span className="mt-3 text-4xl text-fog">$</span>
              <span className="text-[clamp(6rem,10vw,9rem)]">{dollars}</span>
              <span className="mt-3 text-4xl">.{cents}</span>
            </p>
            <p className="mt-4 text-fog">{pricing.unit}{pricing.currency ? ` · ${pricing.currency}` : ''}</p>
            <ButtonLink href="/services" size="lg" className="mt-8 w-full" arrow>Find a provider</ButtonLink>
            <p className="mt-4 text-center text-sm text-haze">Browsing is always free</p>
          </div>
        }
      />

      <section className="surface-light bg-cream py-24 text-forest-900 lg:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow tone="light">What {formatPrice(pricing)} includes</Eyebrow>
            <h2 className="t-h2 mt-6 max-w-[14ch]">Everything you need to make the call.</h2>
          </Reveal>
          <ul className="border-t border-forest-900/15 lg:col-span-6 lg:col-start-7">
            {pricing.includes.map((item, i) => (
              <Reveal as="li" key={item} delay={i * 0.05} className="flex items-start gap-5 border-b border-forest-900/15 py-6 text-lg">
                <svg viewBox="0 0 16 16" className="mt-1.5 size-4 shrink-0 text-moss" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M3 8.5l3 3 7-7" /></svg>
                {item}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="grain relative bg-forest-900 py-24 lg:py-32">
        <div className="container-x">
          <Reveal>
            <Eyebrow>How the fee works</Eyebrow>
          </Reveal>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 md:grid-cols-3">
            {pricing.steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08} className="bg-forest-900 p-8 lg:p-10">
                <span className="t-index text-lime">Step {String(i + 1).padStart(2, '0')}</span>
                <h3 className="t-h3 mt-10 text-cream">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-fog">{s.body}</p>
              </Reveal>
            ))}
          </ol>
          {pricing.note && <p className="mt-8 max-w-3xl text-sm leading-relaxed text-haze">{pricing.note}</p>}
        </div>
      </section>

      <section className="surface-light bg-paper py-24 text-forest-900 lg:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <div className="rounded-md bg-forest-900 p-8 text-mist lg:p-10">
              <p className="t-eyebrow text-lime">For providers</p>
              <h2 className="t-h3 mt-6 text-2xl text-cream">{pricing.providerTitle}</h2>
              <p className="mt-4 leading-relaxed text-fog">{pricing.providerBody}</p>
              <TextLink href="/for-providers#list" className="mt-8 text-cream">Talk to us about listing</TextLink>
            </div>
          </Reveal>
          {pricingFaqs.length > 0 && (
            <div className="lg:col-span-7 lg:col-start-6">
              <Eyebrow tone="light">Pricing questions</Eyebrow>
              <div className="mt-8">
                <FaqList items={pricingFaqs.map((f) => ({ q: f.question, a: f.answer }))} />
              </div>
            </div>
          )}
        </div>
      </section>

      <CtaBand title={home.finalTitle} body={home.finalBody} />
    </>
  )
}
