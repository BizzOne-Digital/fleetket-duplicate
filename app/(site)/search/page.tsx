import Link from 'next/link'
import { SearchBar } from '@/components/live/search-bar'
import { SubServiceCard } from '@/components/live/category'
import { getAreas, getCategories } from '@/lib/content'
import { noIndexMetadata } from '@/lib/seo'

// Search result pages are thin by nature — keep them out of the index.
export const metadata = noIndexMetadata('Search')

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const sp = await searchParams
  const q = (typeof sp.q === 'string' ? sp.q : '').trim().slice(0, 100)
  const area = typeof sp.area === 'string' ? sp.area : ''
  const [categories, areas] = await Promise.all([getCategories(), getAreas()])
  const needle = q.toLowerCase()
  const areaName = areas.find((a) => a.slug === area)?.name

  const results = categories.flatMap((c) =>
    c.subServices
      .filter((s) => !needle || [s.name, s.description, c.name, c.description].some((t) => t.toLowerCase().includes(needle)))
      .map((s) => ({ c, s })),
  )

  return (
    <section className="py-8">
      <div className="container-x grid gap-6">
        <div className="rounded bg-ink p-4">
          <SearchBar categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} areas={areas.map((a) => ({ name: a.name, slug: a.slug }))} />
        </div>
        <h1 className="h-section">
          {q ? <>Results for “{q}”</> : 'All services'}
          {areaName && <span className="text-muted"> in {areaName}</span>}
          <span className="ml-3 text-base font-normal text-muted">{results.length} {results.length === 1 ? 'service' : 'services'}</span>
        </h1>
        {results.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ c, s }) => (
              <li key={`${c.slug}/${s.slug}`}>
                <SubServiceCard category={c} sub={s} count={0} />
                <p className="mt-1.5 text-xs text-muted">{c.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded border border-line bg-panel px-6 py-10 text-center">
            <p className="text-[1.125rem] font-bold text-ink">No Matches Found</p>
            <p className="mt-1 text-muted">
              Try another word, or <Link href="/contact" className="text-brand underline">tell us what you need</Link>.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
