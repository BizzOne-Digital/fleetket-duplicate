import { PageHero, Eyebrow, NumberedList } from '@/components/site/sections'
import { FaqList } from '@/components/site/faq-list'
import { ProviderListingForm } from '@/components/forms/lead-forms'
import { Reveal, ScrollWords } from '@/components/motion'
import { ButtonLink } from '@/components/ui/button'
import { getCategories, getContent, getFaqs } from '@/lib/content'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('providers', '/for-providers')

export default async function ForProvidersPage() {
  const [page, home, categories, faqs] = await Promise.all([getContent('providers'), getContent('home'), getCategories(), getFaqs()])
  const providerFaqs = faqs.filter((f) => f.topic === 'Providers')

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        body={page.body}
        crumbs={[{ label: 'For providers', href: '/for-providers' }]}
        image={page.image}
        imageAlt="Craftsperson at work in a workshop"
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#list" size="lg" arrow>List your service</ButtonLink>
          <ButtonLink href="/pricing" size="lg" variant="outline" className="text-cream">See pricing</ButtonLink>
        </div>
      </PageHero>

      <section className="relative overflow-hidden border-t border-white/[0.07] bg-forest-950 py-24 lg:py-36">
        <div className="container-x">
          <Eyebrow>A better way to advertise</Eyebrow>
          <ScrollWords
            text={home.statement}
            className="mt-10 max-w-[24ch] font-display text-[clamp(1.875rem,4vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-cream"
          />
        </div>
      </section>

      <section className="surface-light bg-cream py-24 text-forest-900 lg:py-32">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <Eyebrow tone="light">Why providers choose Fleeket</Eyebrow>
            <h2 className="t-h2 mt-6">Visibility where it counts.</h2>
          </Reveal>
          <div className="mt-16">
            <NumberedList items={page.benefits} tone="light" columns={3} />
          </div>
        </div>
      </section>

      <section className="grain relative bg-forest-900 py-24 lg:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Eyebrow>Getting listed</Eyebrow>
            <h2 className="t-h2 mt-6 text-cream">Three steps to being found.</h2>
          </Reveal>
          <ol className="grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 lg:col-span-8">
            {page.steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08} className="grid gap-4 bg-forest-900 p-8 sm:grid-cols-[5rem_1fr] lg:p-10">
                <span className="font-display text-4xl font-semibold tracking-[-0.05em] text-moss">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="t-h3 text-cream">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-fog">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="list" className="scroll-mt-16 border-t border-white/[0.07] bg-forest-850 py-24 lg:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Eyebrow>{page.formTitle}</Eyebrow>
            <h2 className="t-h2 mt-6 text-cream">Let’s get you in front of the right people.</h2>
            <p className="mt-5 max-w-sm leading-relaxed text-fog">{page.formBody}</p>
          </Reveal>
          <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.1}>
            <ProviderListingForm categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} />
          </Reveal>
        </div>
      </section>

      {providerFaqs.length > 0 && (
        <section className="surface-light bg-paper py-24 text-forest-900 lg:py-32">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <Eyebrow tone="light">Provider questions</Eyebrow>
              <h2 className="t-h2 mt-6">Before you list.</h2>
            </Reveal>
            <div className="lg:col-span-8">
              <FaqList items={providerFaqs.map((f) => ({ q: f.question, a: f.answer }))} />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
