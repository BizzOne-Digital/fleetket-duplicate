import { AdminHeader } from '@/components/admin/ui'
import { SubscriberMapLoader } from '@/components/map/subscriber-map-loader'
import { ButtonLink } from '@/components/ui/button'
import { db } from '@/lib/content'
import { Category, Subscriber } from '@/lib/models'
import { LIVE_SUBSCRIBER_STATUSES, SUBSCRIBER_STATUSES } from '@/lib/constants'

export const metadata = { title: 'Subscriber map' }

export default async function AdminMapPage() {
  await db()
  const [subs, categories] = await Promise.all([
    Subscriber.find().select('name category status city region location published').lean(),
    Category.find().sort({ order: 1 }).select('name slug').lean(),
  ])
  const located = subs.filter((s) => s.location?.lat != null && s.location?.lng != null)
  const counts = SUBSCRIBER_STATUSES.map((st) => [st, subs.filter((s) => s.status === st).length] as const)

  return (
    <div className="grid gap-6">
      <AdminHeader
        title="Subscriber map"
        description={`${located.length} of ${subs.length} subscribers have a map location. Exact positions are shown here; the public map rounds them to about 1 km and only shows public, active or trial subscribers.`}
        actions={<ButtonLink href="/admin/subscribers/new" variant="dark" size="sm">Add subscriber</ButtonLink>}
      />
      <ul className="flex flex-wrap gap-2 text-sm">
        {counts.map(([st, n]) => (
          <li key={st} className="rounded-sm border border-forest-900/10 bg-white px-3 py-1.5 capitalize">
            <span className={`mr-2 inline-block size-2 rounded-full ${(LIVE_SUBSCRIBER_STATUSES as readonly string[]).includes(st) ? 'bg-lime ring-1 ring-forest-900' : 'bg-sage ring-1 ring-forest-900/40'}`} />
            {st} <span className="tabular-nums text-pebble">{n}</span>
          </li>
        ))}
      </ul>
      <SubscriberMapLoader
        className="h-[72vh] min-h-[28rem]"
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        muted={SUBSCRIBER_STATUSES.filter((s) => !(LIVE_SUBSCRIBER_STATUSES as readonly string[]).includes(s))}
        points={located.map((s) => ({
          id: String(s._id),
          name: s.name,
          category: categories.find((c) => c.slug === s.category)?.name ?? '',
          categorySlug: s.category ?? '',
          city: s.city ?? '',
          region: s.region ?? '',
          lat: s.location!.lat!,
          lng: s.location!.lng!,
          status: `${s.status}${s.published ? '' : ' · hidden from public map'}`,
          href: `/admin/subscribers/${s._id}`,
        }))}
      />
    </div>
  )
}
