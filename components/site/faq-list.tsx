'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/utils'

export function FaqList({ items, tone = 'light', defaultOpen = 0 }: { items: { q: string; a: string }[]; tone?: 'light' | 'dark'; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen)
  const base = useId()
  const dark = tone === 'dark'

  return (
    <div className={cn('border-t', dark ? 'border-white/10' : 'border-forest-900/15')}>
      {items.map((item, i) => {
        const isOpen = open === i
        const id = `${base}-${i}`
        return (
          <div key={i} className={cn('border-b', dark ? 'border-white/10' : 'border-forest-900/15')}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                id={`${id}-button`}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  'group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors md:py-7',
                  dark ? 'text-cream' : 'text-forest-900',
                )}
              >
                <span className="flex gap-5 md:gap-8">
                  <span className={cn('t-index pt-1 md:pt-1.5', dark ? 'text-lime' : 'text-moss')}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-lg font-semibold tracking-[-0.02em] md:text-[1.375rem]">{item.q}</span>
                </span>
                <span aria-hidden className={cn('relative mt-1.5 size-4 shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)]', isOpen && 'rotate-45')}>
                  <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
                  <span className="absolute left-1/2 top-0 h-4 w-px bg-current" />
                </span>
              </button>
            </h3>
            {/* Panels stay in the DOM (crawlable); closed ones are inert and collapse via grid rows. */}
            <div
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-button`}
              inert={!isOpen}
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className={cn('max-w-3xl pb-7 pl-10 leading-relaxed text-pretty md:pl-[3.75rem]', dark ? 'text-fog' : 'text-slate')}>{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
