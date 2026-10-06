import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, MapPin, Phone, Plus } from 'lucide-react'
import { formatPlanPrice, type Category, type Plan, type PublicListing } from '@/lib/content'
import { formatMoney } from '@/lib/listings'
import { resolveImageSrc } from '@/lib/image'

const fmt = new Intl.DateTimeFormat('en-CA', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
const day = (iso: string) => fmt.format(new Date(`${iso}T00:00:00Z`))
export const dateRange = (start: string, end: string) => (start === end ? day(start) : `${day(start)} – ${day(end)}`)

function ListingCard({ listing, fallbackImage, href }: { listing: PublicListing; fallbackImage: string; href: string }) {
  const tel = listing.phone.replace(/[^\d+]/g, '')
  const place = [listing.address, listing.city, listing.region].filter(Boolean).join(', ')
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-sm border border-line bg-white">
      <Link href={href} className="relative block aspect-[16/10] bg-panel" tabIndex={-1} aria-hidden>
        <Image src={resolveImageSrc(listing.photo || fallbackImage)} alt={listing.photo ? listing.title : ''} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-[1.125rem] font-bold leading-snug text-ink">
          <Link href={href} className="hover:text-brand">{listing.title}</Link>
        </h3>
        <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-brand">
          <CalendarDays aria-hidden className="size-4 shrink-0" /> {dateRange(listing.startDate, listing.endDate)}
        </p>
        {place && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place, listing.postalCode].filter(Boolean).join(' '))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-[0.8125rem] hover:text-brand"
          >
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" /> {place}
          </a>
        )}
        <p className="line-clamp-3 whitespace-pre-line text-[0.8125rem]">{listing.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[0.8125rem]">
          <Link href={href} className="rounded border border-brand px-3 py-2 text-brand hover:bg-brand hover:text-white">View ad</Link>
          {tel && (
            <a href={`tel:${tel}`} className="ml-auto inline-flex items-center gap-1.5 rounded bg-brand-light px-3 py-2 text-white hover:bg-brand">
              <Phone aria-hidden className="size-4" /> Call {listing.phone}
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/** A listing category's page body: its live ads and the “Post an ad” call to action. */
export function ListingsBoard({ category, plan, listings }: { category: Category; plan: Plan; listings: PublicListing[] }) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm bg-panel px-5 py-4">
        <div>
          <p className="text-[1.25rem] font-bold text-ink">{listings.length} {listings.length === 1 ? 'Ad' : 'Ads'}</p>
          <p className="text-[0.8125rem] text-muted">{plan.name} · {formatPlanPrice(plan)}</p>
        </div>
        <Link href={`/services/${category.slug}/post`} className="inline-flex items-center gap-2 rounded bg-brand-light px-5 py-2.5 text-white hover:bg-brand">
          <Plus aria-hidden className="size-4" /> Post an ad
        </Link>
      </div>
      {listings.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <li key={l.id}>
              <ListingCard listing={l} fallbackImage={category.image} href={`/services/${category.slug}/ads/${l.id}`} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded border border-dashed border-line px-6 py-10 text-center">
          <p className="text-[1.25rem] font-bold text-ink">No ads right now</p>
          <p className="mt-1 text-muted">Be the first to post in {category.name}.</p>
        </div>
      )}
    </div>
  )
}

/** Price list beside the post-an-ad form. */
export function PricingPanel({ plan }: { plan: Plan }) {
  return (
    <aside className="grid gap-3 rounded-sm bg-panel p-5">
      <h2 className="text-[1.25rem] font-bold text-ink">{plan.name}</h2>
      {plan.summary && <p className="text-[0.8125rem]">{plan.summary}</p>}
      <table className="w-full text-[0.8125rem]">
        <caption className="sr-only">Prices by ad length</caption>
        <tbody>
          {plan.durations.map((d) => (
            <tr key={d.label} className="border-b border-line last:border-0">
              <th scope="row" className="py-2 text-left font-normal">{d.label}</th>
              <td className="py-2 text-right font-bold text-brand">{formatMoney(d.amount, plan.currency || 'CAD')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {plan.includes.length > 0 && (
        <ul className="grid gap-1 text-[0.8125rem]">
          {plan.includes.map((i) => <li key={i}>• {i}</li>)}
        </ul>
      )}
      {plan.requiresApproval && <p className="rounded bg-white px-3 py-2 text-[0.8125rem]">Every ad is checked by our team before it goes live. We’ll email you once it’s published.</p>}
    </aside>
  )
}
