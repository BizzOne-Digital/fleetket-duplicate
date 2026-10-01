import { PageHero, Eyebrow } from '@/components/site/sections'
import { FaqList } from '@/components/site/faq-list'
import { JsonLd } from '@/components/site/json-ld'
import { Reveal } from '@/components/motion'
import { ButtonLink } from '@/components/ui/button'
import { getContent, getFaqs } from '@/lib/content'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('faqPage', '/faq')

export default async function FaqPage() {
  const [page, faqs, site] = await Promise.all([getContent('faqPage'), getFaqs(), getContent('site')])
  const topics = [...new Set(faqs.map((f) => f.topic))]

  return (
    <>
      {faqs.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
          }}
        />
      )}
      <PageHero eyebrow={page.eyebrow} heading={page.heading} body={page.body} crumbs={[{ label: 'FAQ', href: '/faq' }]} image={page.heroImage} />

      <section className="surface-light bg-cream py-24 text-forest-900 lg:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <nav aria-label="FAQ topics" className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="t-eyebrow text-slate">Topics</p>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 lg:block lg:space-y-3">
                {topics.map((t) => (
                  <li key={t}>
                    <a href={`#${t.toLowerCase().replace(/[^a-z]+/g, '-')}`} className="text-slate transition-colors hover:text-forest-900">{t}</a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <div className="space-y-20 lg:col-span-8 lg:col-start-5">
            {topics.length === 0 && <p className="text-slate">No questions have been published yet.</p>}
            {topics.map((t) => (
              <section key={t} id={t.toLowerCase().replace(/[^a-z]+/g, '-')} className="scroll-mt-28" aria-labelledby={`topic-${t}`}>
                <Reveal>
                  <Eyebrow tone="light"><span id={`topic-${t}`}>{t}</span></Eyebrow>
                </Reveal>
                <div className="mt-8">
                  <FaqList items={faqs.filter((f) => f.topic === t).map((f) => ({ q: f.question, a: f.answer }))} defaultOpen={null} />
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="grain relative bg-forest-900 py-24 lg:py-28">
        <div className="container-x flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="t-h2 max-w-[16ch] text-cream">Still have a question?</h2>
            <p className="mt-4 text-fog">Write to us at <a href={`mailto:${site.contactEmail}`} className="text-cream underline underline-offset-4">{site.contactEmail}</a>.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ButtonLink href="/contact" size="lg" variant="light" arrow>Contact Fleeket</ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  )
}
