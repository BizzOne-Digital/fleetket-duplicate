'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useId, useState } from 'react'
import { ChevronDown, CircleHelp } from 'lucide-react'
import { resolveImageSrc } from '@/lib/image'
import { cn } from '@/lib/utils'

/** Numbered grey accordion rows (answers stay in the DOM for search engines). */
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const base = useId()
  return (
    <div className="grid gap-2">
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={i} className="overflow-hidden rounded-sm bg-line/80">
            <h3>
              <button
                type="button"
                id={`${base}-${i}-b`}
                aria-expanded={isOpen}
                aria-controls={`${base}-${i}-p`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center text-left text-[0.8125rem] font-semibold text-ink"
              >
                <span className="grid w-9 shrink-0 self-stretch place-items-center bg-muted py-2 text-white">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 px-3 py-2">{it.q}</span>
                <ChevronDown aria-hidden className={cn('mr-4 size-4 transition-transform', isOpen && 'rotate-180')} />
              </button>
            </h3>
            <div
              id={`${base}-${i}-p`}
              role="region"
              aria-labelledby={`${base}-${i}-b`}
              inert={!isOpen}
              className={cn('grid bg-white transition-[grid-template-rows] duration-300', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
            >
              <div className="overflow-hidden">
                <p className="px-4 py-3 pl-12 leading-relaxed">{it.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** “Have Any Question?” banner + accordion: the FAQ block shared by the home and contact pages. */
export function FaqSection({
  heading,
  bannerImage,
  bannerTitle,
  bannerBody,
  items,
}: {
  heading: string
  bannerImage: string
  bannerTitle: string
  bannerBody: string
  items: { q: string; a: string }[]
}) {
  return (
    <section className="bg-band py-8 sm:py-10">
      <div className="container-x">
        <h2 className="h-section">{heading}</h2>
        <div className="relative mt-5 overflow-hidden rounded-sm">
          <Image src={resolveImageSrc(bannerImage)} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative flex flex-col items-center px-4 py-3 text-center text-white">
            <span className="grid size-[68px] place-items-center rounded-full bg-white text-brand">
              <CircleHelp aria-hidden className="size-7" fill="currentColor" stroke="white" />
            </span>
            <p className="mt-3 text-[1.625rem] font-bold sm:text-[2.0625rem]">{bannerTitle}</p>
            <p className="text-[0.8125rem]">{bannerBody}</p>
            <Link href="/contact" className="mb-1 mt-3 inline-flex items-center gap-2 rounded bg-brand-light px-7 py-2 text-[0.8125rem] transition-colors hover:bg-brand">
              <CircleHelp aria-hidden className="size-5" /> Ask Now
            </Link>
          </div>
        </div>
        <div className="mt-8">
          <FaqAccordion items={items} />
        </div>
      </div>
    </section>
  )
}
