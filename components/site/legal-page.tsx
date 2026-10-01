import { PageHero, RichText } from '@/components/site/sections'
import { LegalToc } from '@/components/site/legal-toc'
import type { DefaultContent } from '@/lib/defaults'

const anchor = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export function LegalPage({ content, path }: { content: DefaultContent['privacy']; path: string }) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        heading={content.title}
        body={content.effectiveDate ? `Effective ${content.effectiveDate}` : undefined}
        crumbs={[{ label: content.title, href: path }]}
        image={content.heroImage}
      />
      <section className="surface-light bg-cream py-20 text-forest-900 lg:py-28">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <LegalToc items={content.sections.map((s) => ({ id: anchor(s.heading), label: s.heading }))} />
          <article className="max-w-3xl lg:col-span-8 lg:col-start-5">
            {content.intro && <p className="text-xl leading-relaxed text-forest-900 text-pretty">{content.intro}</p>}
            {content.sections.map((s, i) => (
              <section key={s.heading} id={anchor(s.heading)} className="mt-12 scroll-mt-28 border-t border-forest-900/15 pt-10 max-lg:scroll-mt-36">
                <h2 className="flex gap-4 font-display text-2xl font-semibold tracking-[-0.025em]">
                  <span className="t-index pt-2 text-moss">{String(i + 1).padStart(2, '0')}</span>
                  {s.heading}
                </h2>
                <RichText text={s.body} className="prose-legal mt-5 leading-relaxed" />
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  )
}
