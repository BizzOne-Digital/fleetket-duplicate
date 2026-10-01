'use client'

import type * as Leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ponytail: OpenStreetMap's public tiles are for light use only (see their tile usage policy).
// Before real traffic, set NEXT_PUBLIC_MAP_TILE_URL (+ _ATTRIBUTION) to a keyed provider such as
// MapTiler, Stadia or Mapbox — nothing else changes.
export const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
/** Default view: Canada and the northern U.S. */
export const DEFAULT_VIEW = { center: [54, -98] as [number, number], zoom: 3 }

/** Leaflet touches `window` at import time, so it's loaded only in the browser. */
export const loadLeaflet = () => import('leaflet').then((m) => (m.default ?? m) as typeof Leaflet)

/** Brand pin as a DOM icon — avoids Leaflet's default image-path issues with bundlers. */
export function pin(L: typeof Leaflet, tone: 'lime' | 'muted' = 'lime') {
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
    html: `<span style="display:grid;place-items:center;width:28px;height:28px;border-radius:9999px;background:${tone === 'lime' ? '#ec1c24' : '#adb5bd'};border:3px solid #fff;box-shadow:0 4px 12px -4px rgb(0 0 0/.55)"><span style="width:6px;height:6px;border-radius:9999px;background:#fff"></span></span>`,
  })
}

export function baseMap(L: typeof Leaflet, el: HTMLElement) {
  const map = L.map(el, { scrollWheelZoom: false, worldCopyJump: true, zoomControl: false }).setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 18, className: 'fk-tiles' }).addTo(map)
  // Zoom with the wheel only after the visitor clicks into the map, so page scrolling never gets trapped.
  map.on('click focus', () => map.scrollWheelZoom.enable())
  map.on('mouseout blur', () => map.scrollWheelZoom.disable())
  return map
}
