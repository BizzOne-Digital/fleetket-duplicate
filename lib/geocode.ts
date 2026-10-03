import 'server-only'
import { getSiteUrl } from './seo'

type Address = { address?: string | null; city?: string | null; region?: string | null; postalCode?: string | null; country?: string | null }

/**
 * Address → map pin via OpenStreetMap Nominatim (free, no key). Tries the full address, then just the
 * city/postal area. Never throws — a failed lookup just leaves the pin for the admin to place.
 * ponytail: Nominatim allows ~1 request/second; fine for sign-ups and admin saves. Swap in a keyed geocoder
 * (MapTiler, Google) here if volume grows.
 */
export async function geocode(a: Address): Promise<{ lat: number; lng: number } | null> {
  const attempts = [
    { street: a.address, city: a.city, state: a.region, postalcode: a.postalCode, country: a.country },
    { city: a.city, state: a.region, country: a.country },
    { postalcode: a.postalCode, country: a.country },
  ]
  for (const q of attempts) {
    const params = Object.entries(q).filter(([, v]) => v && String(v).trim())
    if (!params.some(([k]) => k === 'city' || k === 'postalcode')) continue
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&${new URLSearchParams(params as [string, string][])}`
      const res = await fetch(url, { headers: { 'User-Agent': `Fleeket/1.0 (${getSiteUrl()})`, 'Accept-Language': 'en' }, signal: AbortSignal.timeout(6000), cache: 'no-store' })
      if (!res.ok) continue
      const [hit] = (await res.json()) as { lat: string; lon: string }[]
      if (hit) return { lat: Number(hit.lat), lng: Number(hit.lon) }
    } catch (err) {
      console.error('[geocode] lookup failed', err)
    }
  }
  return null
}
