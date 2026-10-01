'use client'

import { useEffect, useRef } from 'react'
import type * as Leaflet from 'leaflet'
import { baseMap, loadLeaflet, pin } from '@/components/map/leaflet'
import type { LatLng } from '@/lib/fields'

/** Click the map to place the subscriber's pin. Drag to fine-tune; Clear removes it. */
export function LocationField({ label, value, onChange, help, error }: { label: string; value: LatLng | null; onChange: (v: LatLng | null) => void; help?: string; error?: string }) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<Leaflet.Map | null>(null)
  const marker = useRef<Leaflet.Marker | null>(null)
  const L = useRef<typeof Leaflet | null>(null)
  const change = useRef(onChange)
  change.current = onChange

  const round = (n: number) => Math.round(n * 1e5) / 1e5

  useEffect(() => {
    let cancelled = false
    loadLeaflet().then((lib) => {
      if (cancelled || !el.current || map.current) return
      L.current = lib
      map.current = baseMap(lib, el.current)
      map.current.on('click', (e: Leaflet.LeafletMouseEvent) => change.current({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) }))
      if (value) map.current.setView([value.lat, value.lng], 11)
      sync(value)
    })
    return () => {
      cancelled = true
      map.current?.remove()
      map.current = null
      marker.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once; `value` is synced below
  }, [])

  const sync = (v: LatLng | null) => {
    const lib = L.current
    if (!lib || !map.current) return
    if (!v) {
      marker.current?.remove()
      marker.current = null
      return
    }
    if (!marker.current) {
      marker.current = lib.marker([v.lat, v.lng], { icon: pin(lib), draggable: true }).addTo(map.current)
      marker.current.on('dragend', () => {
        const p = marker.current!.getLatLng()
        change.current({ lat: round(p.lat), lng: round(p.lng) })
      })
    } else marker.current.setLatLng([v.lat, v.lng])
  }

  useEffect(() => sync(value), [value])

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-forest-900">{label}</span>
      {help && <span className="-mt-1 text-xs text-pebble">{help}</span>}
      <div ref={el} className="relative z-0 h-72 overflow-hidden rounded-sm border border-forest-900/15 bg-sage/40" aria-label={`${label}: click to place a pin`} />
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate">
        <span>{value ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : 'No location set — click the map'}</span>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-danger hover:underline">
            Clear
          </button>
        )}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
