// Pure helpers (no DB, no Next) so they run under `node --test` — see lib/tasker-rows.test.mjs.

type Row = { status?: string | null; published?: boolean | null; location?: { lat?: number | null; lng?: number | null } | null }

/** Most visible first: a tasker approved anywhere is approved everywhere. */
const RANK = ['active', 'trial', 'past-due', 'paused', 'cancelled', 'pending']

/**
 * A tasker has one Subscriber row per category, but one account and one membership — so status, visibility and map
 * pin must be the same on every row. Rows drift apart when only one of them is edited (admin approval, a geocode on
 * one row, a category added later); this picks the values all rows should share.
 */
export function sharedVisibility(rows: Row[]) {
  const rank = (s?: string | null) => (RANK.includes(s ?? '') ? RANK.indexOf(s!) : RANK.length)
  const best = [...rows].sort((a, b) => rank(a.status) - rank(b.status))[0]
  const located = (r: Row) => r.location?.lat != null && r.location?.lng != null
  const pinned = (best && located(best) ? best : rows.find(located))?.location
  return {
    status: best?.status || 'pending',
    published: rows.some((r) => r.published),
    ...(pinned && { location: { lat: pinned.lat!, lng: pinned.lng! } }),
  }
}

/** Points at the same spot share one map pin (a tasker in three categories is three points, one address). */
export function groupByPin<P extends { lat: number; lng: number }>(points: P[]) {
  const groups = new Map<string, P[]>()
  for (const p of points) {
    const key = `${p.lat},${p.lng}`
    groups.set(key, [...(groups.get(key) ?? []), p])
  }
  return [...groups.values()]
}
