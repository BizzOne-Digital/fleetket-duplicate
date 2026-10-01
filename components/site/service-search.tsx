'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MapPin, Search } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import { Arrow } from '@/components/ui/button'
import { resolveImageSrc } from '@/lib/image'
import { cn } from '@/lib/utils'

export type SearchCategory = {
  name: string
  slug: string
  icon: string
  group: string
  shortDescription: string
  image: string
  serviceTypes: string[]
  featured: boolean
}

export function matchCategories(categories: SearchCategory[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return categories.filter((c) => c.featured).slice(0, 6)
  const score = (c: SearchCategory) => {
    const name = c.name.toLowerCase()
    if (name.startsWith(q)) return 3
    if (name.includes(q)) return 2
    if (c.serviceTypes.some((t) => t.toLowerCase().includes(q)) || c.group.toLowerCase().includes(q)) return 1
    if (c.shortDescription.toLowerCase().includes(q)) return 0.5
    return 0
  }
  return categories
    .map((c) => ({ c, s: score(c) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map((x) => x.c)
}

export function ServiceSearch({ categories, areas, className }: { categories: SearchCategory[]; areas: { name: string; slug: string }[]; className?: string }) {
  const router = useRouter()
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('')
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)

  const results = useMemo(() => matchCategories(categories, query), [categories, query])
  const open = focused && results.length > 0
  const current = results[Math.min(active, results.length - 1)]

  const go = (slug?: string) => {
    const params = new URLSearchParams()
    if (area) params.set('area', area)
    if (slug) {
      router.push(`/services/${slug}${params.size ? `?${params}` : ''}`)
    } else {
      if (query.trim()) params.set('q', query.trim())
      router.push(`/services${params.size ? `?${params}` : ''}`)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % Math.max(results.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === 'Escape') {
      setFocused(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <form
        role="search"
        aria-label="Find a service"
        onSubmit={(e) => {
          e.preventDefault()
          go(open && query.trim() ? current?.slug : undefined)
        }}
        className={cn(
          'relative flex flex-col gap-px overflow-hidden rounded-md border bg-forest-850/90 backdrop-blur-xl transition-[border-color,box-shadow] duration-500 md:flex-row',
          focused ? 'border-lime/40 shadow-[0_0_0_4px_rgb(217_242_90/0.08),var(--shadow-lift)]' : 'border-white/10 shadow-[var(--shadow-lift)]',
        )}
      >
        <label className="flex min-w-0 flex-1 items-center gap-3 px-5 py-4 md:py-0">
          <Search aria-hidden className="size-5 shrink-0 text-fog" strokeWidth={1.5} />
          <span className="sr-only">What do you need help with?</span>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={open && current ? `${id}-opt-${current.slug}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onKeyDown={onKeyDown}
            placeholder="What do you need help with?"
            autoComplete="off"
            className="h-12 w-full min-w-0 bg-transparent text-[1.0625rem] text-cream placeholder:text-fog/80 focus:outline-none md:h-[4.25rem]"
          />
        </label>
        <label className="flex items-center gap-3 border-t border-white/10 px-5 md:w-64 md:border-l md:border-t-0">
          <MapPin aria-hidden className="size-5 shrink-0 text-fog" strokeWidth={1.5} />
          <span className="sr-only">Area</span>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="h-14 w-full cursor-pointer appearance-none bg-transparent text-[0.9375rem] text-mist focus:outline-none md:h-[4.25rem]"
          >
            <option value="" className="bg-forest-850">All areas</option>
            {areas.map((a) => (
              <option key={a.slug} value={a.slug} className="bg-forest-850">{a.name}</option>
            ))}
          </select>
        </label>
        <div className="p-2 md:pl-0">
          <button
            type="submit"
            className="group/btn flex h-12 w-full items-center justify-center gap-2.5 rounded-sm bg-lime px-6 font-medium text-forest-900 transition-colors hover:bg-lime-soft md:h-full md:min-h-[3.25rem]"
          >
            Search <Arrow />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full z-30 mt-2 grid overflow-hidden rounded-md border border-white/10 bg-forest-850 shadow-[var(--shadow-lift)] md:grid-cols-[1fr_17rem]"
          >
            <div>
              <p className="t-eyebrow px-5 pt-4 pb-2 text-haze">{query.trim() ? 'Matching categories' : 'Popular right now'}</p>
              <ul id={`${id}-list`} role="listbox" aria-label="Service categories" className="pb-2">
                {results.map((c, i) => (
                  <li
                    key={c.slug}
                    id={`${id}-opt-${c.slug}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      go(c.slug)
                    }}
                    className={cn('flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors', i === active ? 'bg-white/[0.05]' : '')}
                  >
                    <span className={cn('grid size-9 place-items-center rounded-sm border transition-colors', i === active ? 'border-lime/40 text-lime' : 'border-white/10 text-fog')}>
                      <CategoryIcon name={c.icon} className="size-[1.125rem]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-cream">{c.name}</span>
                      <span className="block truncate text-sm text-haze">{c.group}</span>
                    </span>
                    <span className={cn('text-lime transition-opacity', i === active ? 'opacity-100' : 'opacity-0')}>
                      <Arrow />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {current && (
              <div className="relative hidden border-l border-white/10 md:block">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={current.slug}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0"
                  >
                    <Image src={resolveImageSrc(current.image)} alt="" fill sizes="272px" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/50 to-transparent" />
                    <p className="absolute inset-x-5 bottom-5 text-sm leading-relaxed text-mist">{current.shortDescription}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
