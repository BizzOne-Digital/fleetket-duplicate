// Run: node lib/listings.check.ts — fails loudly if the ad pricing rule breaks.
import assert from 'node:assert/strict'
import { daysInclusive, quoteListing, todayISO } from './listings.ts'

const garage = [
  { label: '1 day', days: 1, amount: 2.99 },
  { label: '1 week', days: 7, amount: 5.99 },
  { label: '1 month', days: 30, amount: 9.99 },
]
const openHouse = [{ label: 'Up to 1 month', days: 30, amount: 9.99 }]

assert.equal(daysInclusive('2026-10-10', '2026-10-10'), 1)
assert.equal(daysInclusive('2026-10-31', '2026-11-01'), 2) // across a month
assert.equal(daysInclusive('2026-11-01', '2026-11-08'), 8) // across the DST change
assert.equal(daysInclusive('2026-10-10', '2026-10-09'), null) // reversed
assert.equal(daysInclusive('2026-13-01', '2026-13-02'), null) // invalid month
assert.equal(quoteListing(garage, '2026-10-10', '2026-10-10')?.amount, 2.99)
assert.equal(quoteListing(garage, '2026-10-10', '2026-10-11')?.amount, 5.99) // 2 days → week price
assert.equal(quoteListing(garage, '2026-10-01', '2026-10-07')?.amount, 5.99)
assert.equal(quoteListing(garage, '2026-10-01', '2026-10-08')?.amount, 9.99)
assert.equal(quoteListing(garage, '2026-10-01', '2026-10-31'), null) // 31 days is over the month cap
assert.equal(quoteListing(openHouse, '2026-10-01', '2026-10-03')?.amount, 9.99) // any length up to a month
assert.equal(quoteListing(openHouse, '2026-10-01', '2026-10-30')?.days, 30)
assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/)
console.log('listings pricing: ok')
