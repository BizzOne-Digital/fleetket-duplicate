import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, CalendarDays, MapPin, Phone, UserRound } from 'lucide-react'
import { Breadcrumb } from '@/components/live/blocks'
import { dateRange } from '@/components/live/listings'
import { getCategory, getListings } from '@/lib/content'
import { resolveImageSrc } from '@/lib/image'
import { buildMetadata } from '@/lib/seo'

/** One live ad. Uses the same loader as the board, so ended, hidden or unapproved ads 404 here too. */
async function load(params: PageProps<'/services/[slug]/ads/[id]'>['params']) {
  const { slug, id } = await params
  const category = await getCategory(slug)
  const listing = category ? (await getListings(slug)).find((l) => l.id === id) : undefined
  return category && listing ? { category, listing } : null
}

export async function generateMetadata({ params }: PageProps<'/services/[slug]/ads/[id]'>): Promise<Metadata> {
  const found = await load(params)
  if (!found) return {}
  const { category, listing } = found
  return buildMetadata({
    title: `${listing.title} — ${category.name}`,
    description: listing.description.slice(0, 160),
    path: `/services/${category.slug}/ads/${listing.id}`,
    image: listing.photo.startsWith('https://') || listing.photo.startsWith('/api/') ? listing.photo : undefined,
  })
}

export default async function AdPage({ params }: PageProps<'/services/[slug]/ads/[id]'>) {
  const found = await load(params)
  if (!found) notFound()
  const { category, listing } = found
  const place = [listing.address, listing.city, listing.region].filter(Boolean).join(', ')
  const tel = listing.phone.replace(/[^\d+]/g, '')

  return (
    <section className="py-8">
      <div className="container-x grid gap-5">
        <Breadcrumb items={[{ label: category.name, href: `/services/${category.slug}` }, { label: listing.title, href: `/services/${category.slug}/ads/${listing.id}` }]} />
        <Link href={`/services/${category.slug}`} className="inline-flex w-fit items-center gap-2 text-[0.9375rem] text-brand hover:underline">
          <ArrowLeft aria-hidden className="size-4" /> Back to all {category.name.toLowerCase()} ads
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="grid gap-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-panel">
              <Image src={resolveImageSrc(listing.photo || category.image)} alt={listing.photo ? listing.title : ''} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
            </div>
            <h1 className="text-[1.75rem] font-bold leading-tight text-ink sm:text-[2rem]">{listing.title}</h1>
            <p className="flex items-center gap-2 font-semibold text-brand">
              <CalendarDays aria-hidden className="size-5 shrink-0" /> {dateRange(listing.startDate, listing.endDate)}
            </p>
            {place && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place, listing.postalCode].filter(Boolean).join(' '))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-start gap-2 hover:text-brand"
              >
                <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" /> {place} <span className="text-[0.8125rem] text-muted">(open in Google Maps)</span>
              </a>
            )}
            <p className="whitespace-pre-line leading-relaxed">{listing.description}</p>
          </article>

          <aside className="h-fit rounded bg-panel p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-[1.25rem] font-bold text-ink">Contact</h2>
            {listing.contactName && (
              <p className="mt-3 flex items-center gap-2">
                <UserRound aria-hidden className="size-5 text-brand" /> <span className="font-semibold">{listing.contactName}</span>
              </p>
            )}
            {tel ? (
              <>
                <a href={`tel:${tel}`} className="mt-4 flex items-center justify-center gap-2 rounded bg-brand-light px-5 py-3 text-white hover:bg-brand">
                  <Phone aria-hidden className="size-5" /> Call {listing.phone}
                </a>
                <p className="mt-2 text-center text-[0.8125rem] text-muted">On a computer? Dial the number above from your phone.</p>
              </>
            ) : (
              <p className="mt-3 text-[0.8125rem] text-muted">The poster didn’t leave a phone number. <Link href="/contact" className="text-brand underline">Contact us</Link> and we’ll pass your message on.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
