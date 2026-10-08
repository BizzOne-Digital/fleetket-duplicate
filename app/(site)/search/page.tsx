import Link from 'next/link'
import { SearchBar } from '@/components/live/search-bar'
import { SubServiceCard } from '@/components/live/category'
import { getAreas, getCategories, getLiveProviders, inArea } from '@/lib/content'
import { noIndexMetadata } from '@/lib/seo'

// Search result pages are thin by nature — keep them out of the index.
export const metadata = noIndexMetadata('Search')

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const sp = await searchParams
  const q = (typeof sp.q === 'string' ? sp.q : '').trim().slice(0, 100)
  const area = typeof sp.area === 'string' ? sp.area : ''
  const service = typeof sp.service === 'string' ? sp.service : ''
  const [categories, areas, providers] = await Promise.all([getCategories(), getAreas(), getLiveProviders()])
  const needle = q.toLowerCase()
  const chosenArea = areas.find((a) => a.slug === area)
  const areaName = chosenArea?.name
  const serviceName = categories.find((c) => c.slug === service)?.name
  // With a city chosen, count only the taskers there — and list only the services that have any.
  const local = chosenArea ? providers.filter((p) => inArea(p, chosenArea)) : []
  const countIn = (c: string, s: string) => local.filter((p) => p.category === c && p.subServices.includes(s)).length

  const results = categories
    .filter((c) => !serviceName || c.slug === service)
    .flatMap((c) =>
      c.subServices
        .filter((s) => !needle || [s.name, s.description, c.name, c.description].some((t) => t.toLowerCase().includes(needle)))
        .map((s) => ({ c, s, count: chosenArea ? countIn(c.slug, s.slug) : 0 })),
    )
    .filter((r) => !chosenArea || r.count > 0)

  return (
    <section className="py-8">
      <div className="container-x grid gap-6">
        <div className="rounded bg-ink p-4">
          <SearchBar categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} areas={areas.map((a) => ({ name: a.name, slug: a.slug }))} initial={{ service: serviceName ? service : '', area: areaName ? area : '', q }} />
        </div>
        <h1 className="h-section">
          {q ? <>Results for “{q}”</> : serviceName ?? 'All services'}
          {areaName && <span className="text-muted"> in {areaName}</span>}
          <span className="ml-3 text-base font-normal text-muted">{results.length} {results.length === 1 ? 'service' : 'services'}</span>
        </h1>
        {results.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ c, s, count }) => (
              <li key={`${c.slug}/${s.slug}`}>
                <SubServiceCard category={c} sub={s} count={count} />
                <p className="mt-1.5 text-xs text-muted">{c.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded border border-line bg-panel px-6 py-10 text-center">
            <p className="text-[1.125rem] font-bold text-ink">No Matches Found</p>
            {areaName ? (
              <p className="mt-1 text-muted">
                No {serviceName ? serviceName.toLowerCase() : ''} taskers in {areaName} yet.{' '}
                {serviceName ? (
                  <Link href={`/services/${service}`} className="text-brand underline">Send a request anyway</Link>
                ) : (
                  <Link href="/contact" className="text-brand underline">Tell us what you need</Link>
                )}{' '}
                and we’ll find one for you.
              </p>
            ) : (
              <p className="mt-1 text-muted">
                Try another word, or <Link href="/contact" className="text-brand underline">tell us what you need</Link>.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
