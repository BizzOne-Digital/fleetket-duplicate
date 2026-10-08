'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, MapPin, Search } from 'lucide-react'

type Option = { name: string; slug: string }

function Cell({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="relative flex min-w-0 flex-1 flex-col justify-center border-b border-line px-3 py-2 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <span className="text-[0.6875rem] text-muted">{label}</span>
      <span className="mt-0.5 flex items-center gap-2">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-white">{icon}</span>
        {children}
      </span>
    </label>
  )
}

/** Search by service, by city, or free text — the three-part search box from fleeket.com. */
export function SearchBar({ categories, areas, initial }: { categories: Option[]; areas: Option[]; initial?: { service?: string; area?: string; q?: string } }) {
  const router = useRouter()
  const [service, setService] = useState(initial?.service ?? '')
  const [area, setArea] = useState(initial?.area ?? '')
  const [q, setQ] = useState(initial?.q ?? '')

  return (
    <form
      role="search"
      aria-label="Find a service"
      onSubmit={(e) => {
        e.preventDefault()
        // A service alone opens its category page; with a city (or words) the search page shows what's available there.
        const params = new URLSearchParams({ ...(service && { service }), ...(area && { area }), ...(q.trim() && { q: q.trim() }) })
        router.push(service && !area && !q.trim() ? `/services/${service}` : `/search${params.size ? `?${params}` : ''}`)
      }}
      className="mx-auto flex max-w-[1260px] flex-col overflow-hidden rounded bg-white p-1.5 shadow-[var(--shadow-lift)] md:flex-row md:items-stretch"
    >
      <Cell label="Search by Service" icon={<Search className="size-3" strokeWidth={2.5} />}>
        <select value={service} onChange={(e) => setService(e.target.value)} className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[0.8125rem] font-semibold text-body focus:outline-none">
          <option value="">Choose Service</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 text-body" />
      </Cell>
      <Cell label="Search by City" icon={<MapPin className="size-3" strokeWidth={2.5} />}>
        <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[0.8125rem] font-semibold text-body focus:outline-none">
          <option value="">Choose City</option>
          {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 text-body" />
      </Cell>
      <Cell label="Search Overall" icon={<Search className="size-3" strokeWidth={2.5} />}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Write how to help You??" className="w-full bg-transparent text-[0.8125rem] font-semibold text-body placeholder:text-body focus:outline-none" />
      </Cell>
      <button type="submit" className="m-1 flex items-center justify-center gap-2 rounded bg-brand-light px-8 py-3 text-[0.8125rem] text-white transition-colors hover:bg-brand md:my-0 md:min-w-[150px]">
        <Search aria-hidden className="size-4" /> Start Search
      </button>
    </form>
  )
}
