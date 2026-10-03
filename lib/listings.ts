// Shared between server and client — pricing for ads in listing categories.

export type ListingDuration = { label: string; days: number; amount: number }

const DAY = 86_400_000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Today's date (YYYY-MM-DD) in Toronto, so “ends today” means the same thing for every visitor in Canada. */
export const todayISO = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto' }).format(now)

/** Inclusive number of days from start to end: the same day = 1. Null for invalid or reversed dates. */
export function daysInclusive(start: string, end: string) {
  if (!ISO_DATE.test(start) || !ISO_DATE.test(end)) return null
  const a = Date.parse(`${start}T00:00:00Z`)
  const b = Date.parse(`${end}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null
  return Math.round((b - a) / DAY) + 1
}

/**
 * The price of an ad running from start to end: the cheapest option long enough to cover it.
 * Garage sale: 1 day / 1 week / 1 month. Open house: one “up to 1 month” option. Null when longer than every option.
 */
export function quoteListing(durations: ListingDuration[], start: string, end: string) {
  const days = daysInclusive(start, end)
  if (days === null) return null
  const fits = durations.filter((d) => d.days >= days).sort((x, y) => x.amount - y.amount)
  return fits[0] ? { days, amount: fits[0].amount, label: fits[0].label } : null
}

export const maxListingDays = (durations: ListingDuration[]) => Math.max(0, ...durations.map((d) => d.days))

export const formatMoney = (amount: number, currency = 'CAD') => (amount > 0 ? `$${amount.toFixed(2)} ${currency}` : 'Free')
