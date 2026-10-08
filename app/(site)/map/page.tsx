import Link from 'next/link'
import { TitleBand } from '@/components/live/blocks'
import { SubscriberMapLoader } from '@/components/map/subscriber-map-loader'
import { getCategories, getPublicMapPoints } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({
    title: 'Providers Map — find taskers near you',
    description: 'See where Fleeket taskers are subscribed across Canada and the United States, by category and area.',
    path: '/map',
  })

export default async function MapPage() {
  const [points, categories] = await Promise.all([getPublicMapPoints(), getCategories()])
  const byCategory = categories.map((c) => ({ ...c, points: points.filter((p) => p.categorySlug === c.slug) })).filter((c) => c.points.length)

  return (
    <>
      <TitleBand title="Providers Map" body="Every pin is a tasker subscribed to Fleeket. Filter by category and service, zoom into your area, and request the service you need." />
      <section className="py-8">
        <div className="container-x">
          <SubscriberMapLoader points={points} categories={categories.map((c) => ({ slug: c.slug, name: c.name, subServices: c.subServices.map((s) => ({ slug: s.slug, name: s.name })) }))} className="h-[65svh] min-h-[26rem]" />
          <p className="mt-3 text-[0.8125rem] text-muted">Locations are approximate to protect taskers’ privacy. Contact details are shared when you confirm a request.</p>

          {byCategory.length > 0 && (
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {byCategory.map((c) => (
                <div key={c.slug}>
                  <h2 className="flex items-baseline justify-between gap-4 border-b-2 border-brand pb-2 text-[1.125rem] font-bold text-ink">
                    <Link href={`/services/${c.slug}`} className="hover:text-brand">{c.name}</Link>
                    <span className="text-sm font-normal text-muted">{c.points.length}</span>
                  </h2>
                  <ul className="mt-1 divide-y divide-line text-[0.8125rem]">
                    {c.points.map((p) => (
                      <li key={p.id} className="flex justify-between gap-4 py-2">
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-muted">{[p.city, p.region].filter(Boolean).join(', ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
