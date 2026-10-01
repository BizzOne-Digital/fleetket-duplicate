import { Fragment } from 'react'
import type { DefaultContent } from '@/lib/defaults'

/** Renders CMS text safely: blank line = paragraph, "- " lines = bullet list. No HTML is ever injected. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((b) => b.trim())
        .filter(Boolean)
        .map((block, i) => {
          const lines = block.split('\n')
          const bullets = lines.filter((l) => l.trim().startsWith('- '))
          const prose = lines.filter((l) => !l.trim().startsWith('- '))
          return (
            <Fragment key={i}>
              {prose.length > 0 && <p>{prose.join(' ')}</p>}
              {bullets.length > 0 && <ul>{bullets.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}</ul>}
            </Fragment>
          )
        })}
    </>
  )
}

const anchor = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export function LegalPage({ content }: { content: DefaultContent['privacy'] }) {
  return (
    <article className="py-8">
      <div className="container-x max-w-4xl">
        <h1 className="text-[1.75rem] font-bold text-ink sm:text-[2rem]">Fleeket.com {content.title}</h1>
        {content.effectiveDate && <p className="mt-2 font-semibold text-muted">Effective Date: {content.effectiveDate}</p>}
        {content.intro && <p className="mt-4 text-[0.9375rem] leading-relaxed">{content.intro}</p>}
        <nav aria-label="Contents" className="mt-6 rounded border border-line bg-panel p-4">
          <p className="font-bold text-ink">Contents</p>
          <ol className="mt-2 grid list-decimal gap-1 pl-5 sm:grid-cols-2">
            {content.sections.map((s) => <li key={s.heading}><a href={`#${anchor(s.heading)}`} className="text-brand hover:underline">{s.heading}</a></li>)}
          </ol>
        </nav>
        {content.sections.map((s, i) => (
          <section key={s.heading} id={anchor(s.heading)} className="mt-8 scroll-mt-20">
            <h2 className="text-[1.25rem] font-bold text-ink">{i + 1}. {s.heading}</h2>
            <div className="prose-legal mt-3 text-[0.9375rem] leading-relaxed">
              <RichText text={s.body} />
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
