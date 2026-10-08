'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type * as Leaflet from 'leaflet'
import { baseMap, DEFAULT_VIEW, loadLeaflet, pin } from '@/components/map/leaflet'
import { cn } from '@/lib/utils'

export type MapPoint = {
  id: string
  name: string
  category: string
  categorySlug: string
  /** Public map: sub-service slugs, for the service filter. */
  subServices?: string[]
  city: string
  region: string
  lat: number
  lng: number
  /** Admin map only. */
  status?: string
  href?: string
}

/** Builds popup content as DOM nodes — subscriber names are user data and never go through innerHTML. */
function popup(p: MapPoint) {
  const el = document.createElement('div')
  el.style.cssText = 'font:14px/1.45 var(--font-sans),system-ui,sans-serif;color:#212529;min-width:160px'
  const title = document.createElement(p.href ? 'a' : 'strong')
  title.textContent = p.name
  title.style.cssText = 'display:block;font-weight:600;font-size:15px;color:#333'
  if (p.href) (title as HTMLAnchorElement).href = p.href
  const meta = document.createElement('div')
  meta.textContent = [p.category, [p.city, p.region].filter(Boolean).join(', ')].filter(Boolean).join(' · ')
  meta.style.cssText = 'color:#6c757d;margin-top:2px'
  el.append(title, meta)
  if (p.status) {
    const s = document.createElement('div')
    s.textContent = p.status
    s.style.cssText = 'margin-top:6px;font-size:12px;text-transform:capitalize;color:#ec1c24;font-weight:600'
    el.append(s)
  }
  if (p.categorySlug && !p.href) {
    const link = document.createElement('a')
    link.href = `/services/${p.categorySlug}`
    link.textContent = 'Request this service →'
    link.style.cssText = 'display:inline-block;margin-top:8px;color:#ec1c24;font-weight:600'
    el.append(link)
  }
  return el
}

export function SubscriberMap({
  points,
  categories,
  className,
  muted = [],
}: {
  points: MapPoint[]
  categories: { slug: string; name: string; subServices?: { slug: string; name: string }[] }[]
  className?: string
  /** Statuses drawn with a muted pin (admin map: paused, past-due…). */
  muted?: string[]
}) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<Leaflet.Map | null>(null)
  const layer = useRef<Leaflet.LayerGroup | null>(null)
  const L = useRef<typeof Leaflet | null>(null)
  const [ready, setReady] = useState(false)
  const [category, setCategory] = useState('')
  const [sub, setSub] = useState('')

  const visible = useMemo(
    () => points.filter((p) => (!category || p.categorySlug === category) && (!sub || p.subServices?.includes(sub))),
    [points, category, sub],
  )
  const usedCategories = useMemo(() => categories.filter((c) => points.some((p) => p.categorySlug === c.slug)), [categories, points])
  // Services of the chosen category that have at least one provider on the map.
  const usedSubs = useMemo(
    () => (categories.find((c) => c.slug === category)?.subServices ?? []).filter((s) => points.some((p) => p.categorySlug === category && p.subServices?.includes(s.slug))),
    [categories, points, category],
  )
  const filterable = usedCategories.length > 1 || points.some((p) => p.subServices?.length)

  useEffect(() => {
    let cancelled = false
    loadLeaflet().then((lib) => {
      if (cancelled || !el.current || map.current) return
      L.current = lib
      map.current = baseMap(lib, el.current)
      layer.current = lib.layerGroup().addTo(map.current)
      setReady(true)
    })
    return () => {
      cancelled = true
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Redraw pins whenever the filter changes, then frame them.
  useEffect(() => {
    const lib = L.current
    if (!ready || !lib || !map.current || !layer.current) return
    layer.current.clearLayers()
    for (const p of visible) {
      lib.marker([p.lat, p.lng], { icon: pin(lib, p.status && muted.includes(p.status) ? 'muted' : 'lime'), title: p.name, alt: p.name })
        .bindPopup(popup(p))
        .addTo(layer.current)
    }
    if (visible.length) map.current.fitBounds(lib.latLngBounds(visible.map((p) => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 11 })
    else map.current.setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom)
  }, [ready, visible, muted])

  return (
    <div className={cn('relative isolate overflow-hidden rounded-md border border-line bg-panel', className)}>
      <div ref={el} className="absolute inset-0 z-0" role="region" aria-label="Map of service providers" />
      <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex flex-wrap items-start justify-between gap-2">
        {filterable && (
          <div className="pointer-events-auto flex flex-wrap gap-2">
            <label>
              <span className="sr-only">Filter by category</span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setSub('')
                }}
                className="h-10 cursor-pointer rounded-full border border-line bg-white/95 px-4 text-sm text-body shadow-[var(--shadow-card)] backdrop-blur focus:border-brand focus:outline-none"
              >
                <option value="">All categories</option>
                {usedCategories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </label>
            {usedSubs.length > 0 && (
              <label>
                <span className="sr-only">Filter by service</span>
                <select
                  value={sub}
                  onChange={(e) => setSub(e.target.value)}
                  className="h-10 cursor-pointer rounded-full border border-line bg-white/95 px-4 text-sm text-body shadow-[var(--shadow-card)] backdrop-blur focus:border-brand focus:outline-none"
                >
                  <option value="">All services</option>
                  {usedSubs.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
              </label>
            )}
          </div>
        )}
        <span className="pointer-events-auto rounded-full bg-ink px-3.5 py-2 text-xs font-medium text-white shadow-[var(--shadow-card)]" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'provider' : 'providers'}
        </span>
      </div>
      {!points.length && (
        <div className="absolute inset-0 z-[400] grid place-items-center bg-white/75 p-6 text-center backdrop-blur-[2px]">
          <div>
            <p className="text-xl font-bold text-ink">No providers on the map yet</p>
            <p className="mt-2 max-w-sm text-sm text-muted">Providers appear here once they subscribe and choose to be shown publicly.</p>
          </div>
        </div>
      )}
    </div>
  )
}
