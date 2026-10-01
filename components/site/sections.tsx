import Link from 'next/link'
import { Fragment } from 'react'
import { ButtonLink } from '@/components/ui/button'
import { Reveal, ScrollMarquee } from '@/components/motion'
import { HeroMedia } from '@/components/site/hero-media'
import { JsonLd } from '@/components/site/json-ld'
import { absoluteUrl } from '@/lib/seo'
import { cn } from '@/lib/utils'

/** Slow-drifting light field + hairline grid. CSS-only, used behind every inner-page hero. */
export function Backdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [background-size:88px_88px] [mask-image:radial-gradient(ellipse_80%_70%_at_70%_20%,black,transparent_75%)]" />
      <div className="absolute -right-[15%] -top-[35%] size-[70vmax] rounded-full bg-[radial-gradient(closest-side,rgb(217_242_90/0.22),transparent)] motion-safe:animate-[drift_24s_ease-in-out_infinite_alternate]" />
      <div className="absolute -bottom-[45%] -left-[20%] size-[60vmax] rounded-full bg-[radial-gradient(closest-side,rgb(217_242_90/0.09),transparent)] motion-safe:animate-[drift_30s_ease-in-out_infinite_alternate-reverse]" />
      {/* Fade into the next section so the glow never ends on a hard seam. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-forest-900" />
    </div>
  )
}

export type Crumb = { label: string; href: string }

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all = [{ label: 'Home', href: '/' }, ...items]
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: absoluteUrl(c.href) })),
        }}
      />
      <nav aria-label="Breadcrumb" className={cn('text-sm text-fog', className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => (
            <Fragment key={c.href}>
              <li>
                {i === all.length - 1 ? (
                  <span aria-current="page" className="text-mist">{c.label}</span>
                ) : (
                  <Link href={c.href} className="transition-colors hover:text-cream">{c.label}</Link>
                )}
              </li>
              {i < all.length - 1 && <li aria-hidden className="text-haze">/</li>}
            </Fragment>
          ))}
        </ol>
      </nav>
    </>
  )
}

/**
 * Splits a heading into masked words that rise in sequence (CSS-driven, server-rendered).
 * CMS syntax: `|` forces a line break, `*words*` sets them in the serif accent.
 */
export function MaskedHeading({ text, className, as: Tag = 'h1', start = 0 }: { text: string; className?: string; as?: 'h1' | 'h2'; start?: number }) {
  const lines = text.split('|')
  let n = 0
  let accent = false
  return (
    <Tag className={className}>
      <span className="sr-only">{lines.join(' ').replace(/\*/g, '')}</span>
      <span aria-hidden>
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line.trim().split(/\s+/).map((raw, wi) => {
              const opens = raw.startsWith('*')
              const closes = raw.endsWith('*') && (raw.length > 1 || !opens)
              if (opens) accent = true
              const isAccent = accent
              if (closes) accent = false
              return (
                <Fragment key={wi}>
                  <span className="word-mask">
                    <span className={isAccent ? 'accent-serif pr-[0.04em]' : undefined} style={{ ['--d' as string]: `${start + n++ * 0.06}s` }}>
                      {raw.replace(/\*/g, '')}
                    </span>
                  </span>{' '}
                </Fragment>
              )
            })}
          </span>
        ))}
      </span>
    </Tag>
  )
}

export function PageHero({
  eyebrow,
  heading,
  body,
  crumbs,
  children,
  aside,
  image,
  imageAlt = '',
}: {
  eyebrow?: string
  heading: string
  body?: string
  crumbs?: Crumb[]
  children?: React.ReactNode
  aside?: React.ReactNode
  /** Full-bleed background photograph. Falls back to the animated light field. */
  image?: string
  imageAlt?: string
}) {
  return (
    <section className="grain relative isolate flex min-h-[72svh] flex-col overflow-hidden bg-forest-900 pt-[calc(var(--header-h)+2rem)] lg:min-h-[86svh] lg:pt-[calc(var(--header-h)+3rem)]">
      {image ? <HeroMedia src={image} alt={imageAlt} /> : <Backdrop />}
      <div className="container-x relative flex flex-1 flex-col">
        {crumbs && <Breadcrumbs items={crumbs} className="rise" />}
        <div className="grid flex-1 gap-10 pb-14 pt-16 lg:grid-cols-12 lg:items-end lg:pb-20">
          <div className={aside ? 'lg:col-span-7' : 'lg:col-span-10'}>
            {eyebrow && (
              <p className="rise t-eyebrow mb-7 flex items-center gap-3 text-lime" style={{ ['--d' as string]: '0.1s' }}>
                <span className="h-px w-10 bg-lime/70" />
                {eyebrow}
              </p>
            )}
            <MaskedHeading text={heading} className="t-h1 max-w-[17ch] text-balance text-cream lg:text-[clamp(3.25rem,5.6vw,5.5rem)]" start={0.15} />
            {body && (
              <p className="rise t-lead mt-8 max-w-2xl text-pretty text-fog" style={{ ['--d' as string]: '0.55s' }}>
                {body}
              </p>
            )}
            {children && <div className="rise mt-10" style={{ ['--d' as string]: '0.7s' }}>{children}</div>}
          </div>
          {aside && <div className="rise lg:col-span-5" style={{ ['--d' as string]: '0.6s' }}>{aside}</div>}
        </div>
        <ScrollCue />
      </div>
    </section>
  )
}

/** Hairline + travelling dot at the foot of every hero: a quiet “there’s more below”. */
export function ScrollCue() {
  return (
    <div aria-hidden className="rise relative hidden h-14 items-center border-t border-white/15 md:flex" style={{ ['--d' as string]: '0.9s' }}>
      <span className="t-eyebrow text-[0.625rem] text-cream/50">Scroll</span>
      <span className="relative ml-4 h-px flex-1 overflow-hidden">
        <span className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-lime to-transparent motion-safe:animate-[cue_3.2s_ease-in-out_infinite]" />
      </span>
    </div>
  )
}

export function Eyebrow({ children, className, tone = 'dark' }: { children: React.ReactNode; className?: string; tone?: 'dark' | 'light' }) {
  return (
    <p className={cn('t-eyebrow flex items-center gap-3', tone === 'dark' ? 'text-lime' : 'text-moss', className)}>
      <span className={cn('h-px w-10', tone === 'dark' ? 'bg-lime/70' : 'bg-moss/60')} />
      {children}
    </p>
  )
}

/** Closing conversion band — the lime brand moment. Giant type drifts sideways with scroll. */
export function CtaBand({ title, body }: { title: string; body: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-lime py-24 text-forest-900 lg:py-32">
      <ScrollMarquee text={title.replace(/[.]/g, '')} className="font-display text-[clamp(5rem,15vw,15rem)] font-semibold leading-none tracking-[-0.06em] text-forest-900/[0.09]" />
      <div className="container-x relative mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-7">
          <h2 className="t-display max-w-[12ch] text-balance">{title}</h2>
        </Reveal>
        <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.15}>
          <p className="t-lead max-w-sm text-forest-900/75">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/services" size="lg" variant="dark" arrow>Find a service</ButtonLink>
            <ButtonLink href="/for-providers" size="lg" variant="outline">List your service</ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Renders CMS text safely: blank line = paragraph, "- " lines = bullet list. No HTML is ever injected. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const lines = block.split('\n')
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}
            </ul>
          )
        }
        const bullets = lines.filter((l) => l.trim().startsWith('- '))
        if (bullets.length) {
          return (
            <Fragment key={i}>
              {lines.filter((l) => !l.trim().startsWith('- ')).map((l, j) => <p key={j}>{l}</p>)}
              <ul>{bullets.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}</ul>
            </Fragment>
          )
        }
        return <p key={i}>{block}</p>
      })}
    </div>
  )
}

/** Large numbered editorial list — the alternative to yet another card grid. */
export function NumberedList({ items, tone = 'dark', columns = 2 }: { items: { title: string; body: string }[]; tone?: 'dark' | 'light'; columns?: 2 | 3 }) {
  return (
    <ol className={cn('grid gap-x-12 border-t', columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2', tone === 'dark' ? 'border-white/10' : 'border-forest-900/15')}>
      {items.map((item, i) => (
        <Reveal as="li" key={item.title} delay={(i % columns) * 0.08} className={cn('border-b py-9', tone === 'dark' ? 'border-white/10' : 'border-forest-900/15')}>
          <div className="flex gap-6">
            <span className={cn('t-index pt-1.5', tone === 'dark' ? 'text-lime' : 'text-moss')}>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className={cn('t-h3', tone === 'dark' ? 'text-cream' : 'text-forest-900')}>{item.title}</h3>
              <p className={cn('mt-3 max-w-md leading-relaxed text-pretty', tone === 'dark' ? 'text-fog' : 'text-slate')}>{item.body}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  )
}
