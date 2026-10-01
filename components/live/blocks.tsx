import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import { JsonLd } from '@/components/site/json-ld'
import { resolveImageSrc } from '@/lib/image'
import { absoluteUrl } from '@/lib/seo'

/** Grey title band with text left and an image right — the top of category pages on fleeket.com. */
export function TitleBand({ title, body, image, imageAlt = '' }: { title: string; body?: string; image?: string; imageAlt?: string }) {
  return (
    <section className="bg-band py-8">
      <div className="container-x grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h1 className="text-[1.75rem] font-bold leading-tight text-ink sm:text-[2rem]">{title}</h1>
          {body && <p className="mt-4 text-[0.8125rem] leading-relaxed">{body}</p>}
        </div>
        {image && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image src={resolveImageSrc(image)} alt={imageAlt} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
        )}
      </div>
    </section>
  )
}

export type Crumb = { label: string; href: string }

/** Bordered breadcrumb (Home > Services > …), with BreadcrumbList structured data. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  const all = [{ label: 'Home', href: '/' }, { label: 'Services', href: '/#services' }, ...items]
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: absoluteUrl(c.href) })),
        }}
      />
      <nav aria-label="Breadcrumb" className="rounded border border-line bg-white px-4 py-2 text-[0.9375rem] font-bold">
        <ol className="flex flex-wrap items-center gap-x-2">
          {all.map((c, i) => (
            <Fragment key={c.href + i}>
              <li>
                {i === all.length - 1 ? (
                  <span aria-current="page" className="text-brand">{c.label}</span>
                ) : (
                  <Link href={c.href} className="text-muted hover:text-ink">{c.label}</Link>
                )}
              </li>
              {i < all.length - 1 && <li aria-hidden className="font-normal text-muted">&gt;</li>}
            </Fragment>
          ))}
        </ol>
      </nav>
    </>
  )
}

/** Pink “Advertising area” banner under the services — shows Fleeket offers or the category's plan. */
export function OffersBanner({ title, subtitle, body }: { title: string; subtitle?: string; body?: string }) {
  return (
    <aside aria-label={title} className="rounded bg-blush px-6 py-10 text-center text-blush-ink">
      <p className="text-[1.75rem] font-bold uppercase tracking-wide">{title}</p>
      {subtitle && <p className="mt-1 text-[0.8125rem]">{subtitle}</p>}
      {body && <p className="mx-auto mt-2 max-w-2xl whitespace-pre-line text-[0.8125rem]">{body}</p>}
    </aside>
  )
}
