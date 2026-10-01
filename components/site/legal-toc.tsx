'use client'

import { useEffect, useState } from 'react'
import { scrollToElement } from '@/components/site/experience'
import { cn } from '@/lib/utils'

type Item = { id: string; label: string }

const READING_LINE = 150 // px below the top of the viewport where a section counts as “being read”

function jump(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  history.replaceState(null, '', `#${id}`)
  scrollToElement(el)
}

/** “On this page” navigation for long legal documents: highlights the section being read and scrolls precisely. */
export function LegalToc({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    // The active section is the last heading that has scrolled above the reading line.
    const update = () => {
      let current = items[0]?.id
      for (const { id } of items) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= READING_LINE) current = id
      }
      // At the very bottom, the last section is the one being read even if it's short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = items[items.length - 1]?.id
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [items])

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setActive(id)
    jump(id)
  }

  return (
    <>
      {/* Desktop: sticky list with an active marker */}
      <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-28">
          <p className="t-eyebrow text-slate">On this page</p>
          <ol className="mt-5 space-y-1 border-l border-sage text-sm">
            {items.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => onClick(e, s.id)}
                  aria-current={active === s.id ? 'location' : undefined}
                  className={cn(
                    '-ml-px flex gap-3 border-l-2 py-1.5 pl-4 transition-colors duration-300',
                    active === s.id ? 'border-forest-900 font-medium text-forest-900' : 'border-transparent text-slate hover:text-forest-900',
                  )}
                >
                  <span className={cn('t-index', active === s.id ? 'text-moss' : 'text-pebble')}>{String(i + 1).padStart(2, '0')}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => (window.fkLenis ? window.fkLenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }))} className="mt-6 pl-4 text-sm text-slate underline underline-offset-4 hover:text-forest-900">
            Back to top
          </button>
        </div>
      </nav>

      {/* Mobile: a jump menu pinned under the header */}
      <div className="sticky top-16 z-10 -mx-[var(--gutter)] border-b border-sage bg-cream/95 px-[var(--gutter)] py-3 backdrop-blur-xl lg:hidden">
        <label className="flex items-center gap-3 text-sm">
          <span className="shrink-0 font-medium text-forest-900">Jump to</span>
          <select
            value={active}
            onChange={(e) => {
              setActive(e.target.value)
              jump(e.target.value)
            }}
            className="h-10 min-w-0 flex-1 cursor-pointer rounded-sm border border-forest-900/15 bg-paper px-3 text-forest-900 focus:border-forest-900 focus:outline-none"
          >
            {items.map((s, i) => (
              <option key={s.id} value={s.id}>{`${String(i + 1).padStart(2, '0')}  ${s.label}`}</option>
            ))}
          </select>
        </label>
      </div>
    </>
  )
}
