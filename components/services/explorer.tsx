'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MapPin, Search, X } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import type { SearchCategory } from '@/components/site/service-search'
import { resolveImageSrc } from '@/lib/image'
import { cn } from '@/lib/utils'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function Row({ c, n, area }: { c: SearchCategory; n: number; area: string }) {
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-forest-900/12"
    >
      <Link href={`/services/${c.slug}${area ? `?area=${area}` : ''}`} className="group/row relative block overflow-hidden">
        {/* Lime fill sweeps in from the left on hover/focus */}
        <span aria-hidden className="absolute inset-0 origin-left scale-x-0 bg-lime transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/row:scale-x-100 group-focus-visible/row:scale-x-100" />
        <div className="relative grid grid-cols-[4.5rem_1fr_auto] items-center gap-5 py-5 sm:grid-cols-[3rem_1fr_auto] md:gap-8 md:py-7 lg:grid-cols-[3rem_minmax(0,1.1fr)_minmax(0,1fr)_auto]">
          {/* Thumbnail: always on mobile, revealed on hover from desktop */}
          <span className="relative block aspect-square w-[4.5rem] overflow-hidden rounded-sm sm:hidden">
            <Image src={resolveImageSrc(c.image)} alt="" fill sizes="72px" className="object-cover" />
          </span>
          <span className="t-index hidden text-pebble transition-colors group-hover/row:text-forest-900 sm:block">{String(n).padStart(2, '0')}</span>
          <span className="min-w-0">
            <span className="flex items-center gap-3">
              <CategoryIcon name={c.icon} className="hidden size-5 shrink-0 text-moss transition-colors group-hover/row:text-forest-900 md:block" />
              <span className="font-display text-[clamp(1.375rem,2.4vw,2.25rem)] font-semibold leading-tight tracking-[-0.035em] text-forest-900 transition-transform duration-700 ease-[var(--ease-out-expo)] md:group-hover/row:translate-x-2">
                {c.name}
              </span>
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-slate lg:hidden">{c.shortDescription}</span>
          </span>
          <span className="hidden text-[0.9375rem] leading-relaxed text-slate transition-colors group-hover/row:text-forest-900 lg:block">{c.shortDescription}</span>
          <span className="relative flex items-center justify-end">
            <span className="pointer-events-none absolute right-14 top-1/2 hidden h-24 w-36 -translate-y-1/2 overflow-hidden rounded-sm opacity-0 shadow-[var(--shadow-card)] transition-[opacity,clip-path] duration-700 ease-[var(--ease-out-expo)] [clip-path:inset(0_0_0_100%)] group-hover/row:opacity-100 group-hover/row:[clip-path:inset(0_0_0_0)] xl:block">
              <Image src={resolveImageSrc(c.image)} alt="" fill sizes="144px" className="object-cover" />
            </span>
            <span className="grid size-11 place-items-center rounded-full border border-forest-900/20 text-forest-900 transition-colors duration-300 group-hover/row:border-forest-900 group-hover/row:bg-forest-900 group-hover/row:text-lime">
              <svg viewBox="0 0 16 16" className="size-4 -rotate-45 transition-transform duration-500 group-hover/row:rotate-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </span>
          </span>
        </div>
      </Link>
    </motion.li>
  )
}

export function ServicesExplorer({ categories, groups, areas }: { categories: SearchCategory[]; groups: string[]; areas: { name: string; slug: string }[] }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('All')
  const [area, setArea] = useState('')
  const [activeGroup, setActiveGroup] = useState(groups[0])

  // Hydrate filters from the URL (?q=&area=) after mount so the page itself stays static and crawlable.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setQuery(p.get('q') ?? '')
    setArea(p.get('area') ?? '')
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categories.filter(
      (c) =>
        (group === 'All' || c.group === group) &&
        (!q || [c.name, c.group, c.shortDescription, ...c.serviceTypes].some((t) => t.toLowerCase().includes(q))),
    )
  }, [categories, query, group])

  const visibleGroups = groups.filter((g) => filtered.some((c) => c.group === g))

  // Highlight the group currently in view in the side index.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveGroup((e.target as HTMLElement).dataset.group!)),
      { rootMargin: '-35% 0px -55% 0px' },
    )
    document.querySelectorAll<HTMLElement>('[data-group]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [visibleGroups.join('|')])

  const areaName = areas.find((a) => a.slug === area)?.name
  const reset = () => {
    setQuery('')
    setGroup('All')
    setArea('')
  }

  let n = 0
  return (
    <div>
      {/* Search console */}
      <div className="sticky top-16 z-20 -mx-[var(--gutter)] border-b border-sage bg-cream/92 px-[var(--gutter)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:gap-8">
          <label className="group flex flex-1 items-center gap-4 border-b-2 border-forest-900/15 pb-2 transition-colors focus-within:border-forest-900">
            <Search aria-hidden className="size-6 shrink-0 text-forest-900/50" strokeWidth={1.5} />
            <span className="sr-only">Search services</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “snow removal”, “tutor”, “movers”…"
              className="h-11 w-full bg-transparent font-display text-xl tracking-[-0.02em] text-forest-900 placeholder:text-forest-900/35 focus:outline-none md:text-2xl"
            />
          </label>
          <label className="relative flex items-center gap-2 text-sm text-slate">
            <MapPin aria-hidden className="size-4" />
            <span className="sr-only">Area</span>
            <select value={area} onChange={(e) => setArea(e.target.value)} className="h-11 cursor-pointer appearance-none rounded-full border border-forest-900/15 bg-paper pl-4 pr-10 text-sm text-forest-900 focus:border-forest-900 focus:outline-none">
              <option value="">All areas</option>
              {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
            </select>
            <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute right-4 size-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6l4 4 4-4" /></svg>
          </label>
        </div>
        <div role="tablist" aria-label="Filter by group" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto pb-3">
          {['All', ...groups].map((g) => (
            <button
              key={g}
              role="tab"
              aria-selected={group === g}
              onClick={() => setGroup(g)}
              className={cn(
                'relative shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors duration-300',
                group === g ? 'text-forest-900' : 'text-slate hover:text-forest-900',
              )}
            >
              {group === g && <motion.span layoutId="group-pill" className="absolute inset-0 rounded-full bg-lime" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="relative">{g}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate" aria-live="polite">
        <span>
          <strong className="font-semibold text-forest-900">{filtered.length}</strong> {filtered.length === 1 ? 'category' : 'categories'}
          {areaName ? <> to browse in <strong className="font-semibold text-forest-900">{areaName}</strong></> : null}
        </span>
        {(query || group !== 'All' || area) && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 font-medium text-moss hover:text-forest-900">
            <X aria-hidden className="size-3.5" /> Clear filters
          </button>
        )}
      </div>

      {filtered.length ? (
        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <nav aria-label="Groups" className="hidden lg:col-span-3 lg:block">
            <ul className="sticky top-60 space-y-1">
              {visibleGroups.map((g) => (
                <li key={g}>
                  <a
                    href={`#${slugify(g)}`}
                    className={cn('group flex items-center gap-3 py-1.5 text-[0.9375rem] transition-colors', activeGroup === g ? 'text-forest-900' : 'text-pebble hover:text-forest-900')}
                  >
                    <span className={cn('h-px bg-forest-900 transition-all duration-500 ease-[var(--ease-out-expo)]', activeGroup === g ? 'w-8' : 'w-3 opacity-40')} />
                    {g}
                    <span className="t-index text-pebble">{filtered.filter((c) => c.group === g).length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-20 lg:col-span-9">
            {visibleGroups.map((g) => (
              <section key={g} id={slugify(g)} data-group={g} className="scroll-mt-64" aria-labelledby={`${slugify(g)}-h`}>
                <div className="flex items-end justify-between gap-6 border-b-2 border-forest-900 pb-4">
                  <h2 id={`${slugify(g)}-h`} className="font-display text-[clamp(1.75rem,3vw,2.75rem)] font-semibold tracking-[-0.04em] text-forest-900">{g}</h2>
                  <span className="t-index pb-1.5 text-slate">{filtered.filter((c) => c.group === g).length} categories</span>
                </div>
                <ul>
                  <AnimatePresence initial={false}>
                    {filtered.filter((c) => c.group === g).map((c) => <Row key={c.slug} c={c} n={++n} area={area} />)}
                  </AnimatePresence>
                </ul>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 rounded-md border border-dashed border-forest-900/20 px-6 py-24 text-center">
          <p className="font-display text-3xl font-semibold tracking-[-0.03em] text-forest-900">Nothing matches “{query}”.</p>
          <p className="mx-auto mt-3 max-w-md text-slate">
            Try a broader word, or <Link href="/contact" className="font-medium text-moss underline underline-offset-2">tell us what you need</Link> and we’ll help you find the right provider.
          </p>
          <button type="button" onClick={reset} className="mt-8 rounded-full bg-forest-900 px-6 py-3 text-sm font-medium text-cream">Show all categories</button>
        </div>
      )}
    </div>
  )
}
