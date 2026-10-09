// Run: node scripts/test-open-house-map.cjs [--live]
// --live reads the configured database and geocoder; it never writes records or sends email.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
const ts = require('typescript')
const path = require('node:path')
function load(file, imports) {
  const filename = path.resolve(file)
  const m = new Module(filename, module)
  m.filename = filename
  m.paths = module.paths
  m.require = (id) => id in imports ? imports[id] : require(id)
  m._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename)
  return m.exports
}
const day = '2026-10-09'
const categories = ['open-house', 'garage-sale', 'free-ads', 'new-ad-category', 'automotive'].map(slug => ({ _id: slug, slug, name: slug, plan: slug, published: true, subServices: [] }))
const plans = categories.map(c => ({ _id: c.slug, slug: c.plan, billing: c.slug === 'automotive' ? 'subscription' : 'listing', published: true }))
const base = { category: 'open-house', title: 'Open House fixture', status: 'published', published: true, startDate: day, endDate: day, address: 'valid', city: 'Toronto', region: 'ON', postalCode: 'M5V' }
let ads = [
  { ...base, _id: 'eligible' },
  { ...base, _id: 'hidden', published: false },
  { ...base, _id: 'unpaid', status: 'awaiting-payment' },
  { ...base, _id: 'review', status: 'pending-review' },
  { ...base, _id: 'expired', endDate: '2026-10-08' },
  { ...base, _id: 'garage', category: 'garage-sale' },
  { ...base, _id: 'free', category: 'free-ads' },
  { ...base, _id: 'new', category: 'new-ad-category' },
  { ...base, _id: 'non-ad', category: 'automotive' },
  { ...base, _id: 'invalid', address: 'invalid' },
  { ...base, _id: 'missing', address: 'missing' },
  { ...base, _id: 'future', startDate: '2026-10-10', endDate: '2026-10-12' },
]
function matches(row, filter) {
  return Object.entries(filter).every(([key, v]) => {
    if (v && typeof v === 'object') return Object.entries(v).every(([op, value]) => op === '$ne' ? row[key] !== value : op === '$gte' ? row[key] >= value : op === '$in' ? value.includes(row[key]) : false)
    return row[key] === v
  })
}
function model(rows) {
  return { find(filter) { const query = { sort() { return query }, select() { return query }, async lean() { return rows().filter(r => matches(r, filter)) } }; return query } }
}
async function run() {
  const live = process.argv.includes('--live')
  let mongoose
  let models = { Category: model(() => categories), Plan: model(() => plans), Listing: model(() => ads), Subscriber: model(() => []) }
  let geocode = async ({ address }) => address === 'missing' ? null : address === 'invalid' ? { lat: NaN, lng: 181 } : { lat: 43.65, lng: -79.38 }
  let todayISO = () => day
  if (live) {
    require('@next/env').loadEnvConfig(process.cwd())
    mongoose = require('mongoose')
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB, serverSelectionTimeoutMS: 8000 })
    for (const [name, collection] of Object.entries({ Category: 'categories', Plan: 'plans', Listing: 'listings', Subscriber: 'subscribers' })) {
      models[name] = { find(filter) { const query = { sort() { return query }, select() { return query }, lean: () => mongoose.connection.db.collection(collection).find(filter).toArray() }; return query } }
    }
    geocode = load('lib/geocode.ts', { 'server-only': {}, './seo': { getSiteUrl: () => 'https://www.fleeket.com' } }).geocode
    todayISO = () => new Date().toISOString().slice(0, 10)
  }
  models.Content = { updateOne: async () => ({ upsertedCount: 0 }), findOne: () => ({ lean: async () => ({ value: { done: true } }) }) }
  models.User = { exists: async () => true }
  const api = load('lib/content.ts', {
    'server-only': {}, react: { cache: fn => fn }, 'next/cache': { unstable_cache: fn => fn },
    './db': { isDbConfigured: true, connectDb: async () => {} }, './models': models,
    './defaults': {}, './listings': { todayISO }, './constants': { LIVE_SUBSCRIBER_STATUSES: ['active', 'trial'] },
    './auth': {}, './geocode': { geocode },
  })
  try {
    const points = await api.getListingMapPoints()
    const publicPlans = await api.getPlans()
    const adCategories = (await api.getCategories()).filter(c => publicPlans.some(p => p.slug === c.plan && p.billing === 'listing'))
    const board = (await Promise.all(adCategories.map(async c => (await api.getListings(c.slug)).map(a => ({ ...a, category: c.slug }))))).flat()
    for (const p of points) {
      assert.ok(adCategories.some(c => c.slug === p.categorySlug))
      assert.ok(Number.isFinite(p.lat) && Math.abs(p.lat) <= 90)
      assert.ok(Number.isFinite(p.lng) && Math.abs(p.lng) <= 180)
      assert.ok(board.some(a => p.href === `/services/${a.category}/ads/${a.id}`))
      assert.deepEqual(p.subServices, [])
    }
    if (live) {
      assert.ok(board.length, 'No eligible ad to verify')
      assert.equal(points.length, board.length, 'An eligible could not be geocoded')
      console.log('LIVE: all', board.length, 'eligible ads have valid map coordinates and matching detail links')
      console.log(JSON.stringify(points.map(p => ({ id: p.id, href: p.href, validCoordinates: true }))))
    } else {
      assert.deepEqual(points.map(p => p.id), ['listing-eligible', 'listing-future', 'listing-garage', 'listing-free', 'listing-new'])
      ads[0].published = false
      assert.ok(!(await api.getListingMapPoints()).some(p => p.id === 'listing-eligible'))
      categories[0].published = false
      assert.ok(!(await api.getListingMapPoints()).some(p => p.categorySlug === 'open-house'))
      plans.find(p => p.slug === 'garage-sale').published = false
      assert.ok(!(await api.getListingMapPoints()).some(p => p.categorySlug === 'garage-sale'))
      console.log('PASS: eligible and upcoming ads, hidden/unpaid/pending/expired exclusions, all ad types included dynamically, non-ad categories excluded, hidden plans excluded, invalid/missing coordinates skipped, category visibility, current visibility and detail links')
    }
  } finally { if (mongoose) await mongoose.disconnect() }
}
run().catch(err => { console.error(err.message); process.exitCode = 1 })
