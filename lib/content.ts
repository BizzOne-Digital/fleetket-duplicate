import 'server-only'
import { cache } from 'react'
import { connectDb, isDbConfigured } from './db'
import { Category as CategoryModel, City, Content, Faq, Plan as PlanModel, Subscriber, User } from './models'
import { DEFAULT_CATEGORIES, DEFAULT_CITIES, DEFAULT_CONTENT, DEFAULT_FAQS, PLACEHOLDER_CATEGORIES, PLACEHOLDER_PLAN, type CategorySeed, type DefaultContent } from './defaults'
import { LIVE_SUBSCRIBER_STATUSES } from './constants'
import { hashPassword } from './auth'
import type { ContentKey } from './content-schema'

export type SubService = { name: string; slug: string; description: string; image: string; legacyId?: number }
export type Category = Omit<CategorySeed, 'subServices' | 'legacyId'> & {
  id: string
  legacyId?: number
  subServices: SubService[]
  plan: string
  seoTitle: string
  seoDescription: string
  published: boolean
  order: number
}
export type Plan = {
  slug: string
  name: string
  billing: 'one-time' | 'subscription'
  amount: number
  currency: string
  interval: 'month' | 'year'
  trialDays: number
  payer: 'customer' | 'provider'
  summary: string
  includes: string[]
}
export type Area = {
  id: string
  name: string
  slug: string
  country: 'CA' | 'US'
  kind: string
  region: string
  regionCode: string
  description: string
  image: string
  seoTitle: string
  seoDescription: string
  categories: string[]
  published: boolean
  order: number
}
export type FaqItem = { id: string; question: string; answer: string; topic: string }

/* ---------- Seeding: runs once per server instance, guarded by a flag document ---------- */

let seedPromise: Promise<void> | null = null

const isDuplicate = (err: unknown) => (err as { code?: number })?.code === 11000

/**
 * Runs a one-time seed step exactly once, even when several server instances (serverless cold
 * starts, parallel build workers) hit an empty database together. The first instance atomically
 * claims the flag and does the work; the others wait for it to finish so they never read half-seeded data.
 */
async function once(key: string, work: () => Promise<void>) {
  let claimed = false
  try {
    const res = await Content.updateOne({ key }, { $setOnInsert: { key, value: { done: false } } }, { upsert: true })
    claimed = res.upsertedCount === 1
  } catch (err) {
    if (!isDuplicate(err)) throw err
  }
  if (claimed) {
    try {
      await work()
      await Content.updateOne({ key }, { $set: { value: { done: true, at: new Date().toISOString() } } })
    } catch (err) {
      await Content.deleteOne({ key }) // release the claim so the next start retries
      throw err
    }
    return
  }
  // ponytail: polls up to ~15s for the winner; a seed that slow means something else is wrong.
  for (let i = 0; i < 60; i++) {
    const flag = await Content.findOne({ key }).lean<{ value?: { done?: boolean } }>()
    if (!flag || flag.value?.done !== false) return
    await new Promise((r) => setTimeout(r, 250))
  }
}

async function seed() {
  await once('__seeded', async () => {
    await CategoryModel.insertMany(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, order: i, published: true })), { ordered: false }).catch(() => {})
    await City.insertMany(DEFAULT_CITIES.map((c, i) => ({ ...c, country: 'CA', order: i, published: true })), { ordered: false }).catch(() => {})
    await Faq.insertMany(DEFAULT_FAQS.map((f, i) => ({ ...f, order: i, published: true })))
    await Content.bulkWrite(
      Object.entries(DEFAULT_CONTENT).map(([key, value]) => ({
        updateOne: { filter: { key }, update: { $setOnInsert: { key, value } }, upsert: true },
      })),
    )
  })

  // v2 (one-time, additive): a placeholder subscription plan + 3 hidden categories awaiting the client's details.
  await once('__seeded_v2', async () => {
    await PlanModel.updateOne({ slug: PLACEHOLDER_PLAN.slug }, { $setOnInsert: PLACEHOLDER_PLAN }, { upsert: true })
    const last = await CategoryModel.findOne().sort({ order: -1 }).select('order').lean<{ order?: number }>()
    await Promise.all(
      PLACEHOLDER_CATEGORIES.map((c, i) =>
        CategoryModel.updateOne({ slug: c.slug }, { $setOnInsert: { ...c, order: (last?.order ?? 0) + 1 + i, published: false } }, { upsert: true }),
      ),
    )
  })

  // Bootstrap the first owner account from env, only while no administrator exists.
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD
  if (email && password && password.length >= 10) {
    const hasAdmin = await User.exists({ role: { $in: ['owner', 'admin'] } })
    if (!hasAdmin) {
      await User.create({ name: 'Fleeket Admin', email, passwordHash: await hashPassword(password), role: 'owner' }).catch((err) => {
        if (!isDuplicate(err)) throw err // another instance created it first
      })
    }
  }
}

/** Connects and makes sure first-run content exists. Every DB-backed read goes through here. */
export async function db() {
  await connectDb()
  seedPromise ??= seed().catch((err) => {
    seedPromise = null
    throw err
  })
  await seedPromise
}

/** Public reads fall back to bundled defaults when no database is configured or it is unreachable. */
async function read<T>(label: string, fromDb: () => Promise<T>, fallback: () => T): Promise<T> {
  if (!isDbConfigured) return fallback()
  try {
    await db()
    return await fromDb()
  } catch (err) {
    console.error(`[content] ${label} failed, serving defaults:`, err)
    return fallback()
  }
}

/* ---------- Mappers ---------- */

type Lean = Record<string, unknown> & { _id: unknown }
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : [])

function toCategory(d: Lean): Category {
  const subs = Array.isArray(d.subServices) ? (d.subServices as Lean[]) : []
  return {
    id: String(d._id),
    legacyId: typeof d.legacyId === 'number' ? d.legacyId : undefined,
    name: str(d.name),
    slug: str(d.slug),
    group: str(d.group),
    icon: str(d.icon) || 'sparkles',
    description: str(d.description),
    image: str(d.image),
    imageAlt: str(d.imageAlt) || str(d.name),
    subServices: subs.map((x) => ({
      name: str(x.name),
      slug: str(x.slug),
      description: str(x.description),
      image: str(x.image),
      legacyId: typeof x.legacyId === 'number' ? x.legacyId : undefined,
    })),
    plan: str(d.plan),
    published: d.published !== false,
    order: Number(d.order ?? 0),
    seoTitle: str(d.seoTitle),
    seoDescription: str(d.seoDescription),
  }
}

function toArea(d: Lean): Area {
  return {
    id: String(d._id),
    name: str(d.name),
    slug: str(d.slug),
    country: d.country === 'US' ? 'US' : 'CA',
    kind: str(d.kind),
    region: str(d.region),
    regionCode: str(d.regionCode),
    description: str(d.description),
    image: str(d.image),
    seoTitle: str(d.seoTitle),
    seoDescription: str(d.seoDescription),
    categories: arr(d.categories),
    published: d.published !== false,
    order: Number(d.order ?? 0),
  }
}

const defaultCategories = () =>
  DEFAULT_CATEGORIES.map((c, i) => toCategory({ ...c, _id: `default-${c.slug}`, order: i, published: true }))
const defaultAreas = () =>
  DEFAULT_CITIES.map((c, i) => toArea({ ...c, _id: `default-${c.slug}`, country: 'CA', order: i, published: true }))

/* ---------- Public queries (deduped per request with React cache) ---------- */

export const getCategories = cache(() =>
  read(
    'categories',
    async () => (await CategoryModel.find({ published: true }).sort({ order: 1, name: 1 }).lean()).map((d) => toCategory(d as Lean)),
    defaultCategories,
  ),
)

export const getCategory = cache(async (slug: string) => (await getCategories()).find((c) => c.slug === slug) ?? null)

export const getAreas = cache(() =>
  read(
    'areas',
    async () => (await City.find({ published: true }).sort({ country: 1, order: 1, name: 1 }).lean()).map((d) => toArea(d as Lean)),
    defaultAreas,
  ),
)

export const getArea = cache(async (slug: string) => (await getAreas()).find((a) => a.slug === slug) ?? null)

export const getFaqs = cache(() =>
  read(
    'faqs',
    async () =>
      (await Faq.find({ published: true }).sort({ order: 1 }).lean()).map((d) => ({
        id: String(d._id),
        question: d.question,
        answer: d.answer,
        topic: d.topic ?? 'General',
      })),
    () => DEFAULT_FAQS.map((f, i) => ({ id: `default-${i}`, ...f })),
  ),
)

export const getContent = cache(<K extends ContentKey>(key: K) =>
  read(
    `content:${key}`,
    async () => {
      const doc = await Content.findOne({ key }).lean()
      return { ...DEFAULT_CONTENT[key], ...((doc?.value as object) ?? {}) } as DefaultContent[K]
    },
    () => DEFAULT_CONTENT[key],
  ),
)

const toPlan = (d: Lean): Plan => ({
  slug: str(d.slug),
  name: str(d.name),
  billing: d.billing === 'one-time' ? 'one-time' : 'subscription',
  amount: Number(d.amount ?? 0),
  currency: str(d.currency),
  interval: d.interval === 'year' ? 'year' : 'month',
  trialDays: Number(d.trialDays ?? 0),
  payer: d.payer === 'customer' ? 'customer' : 'provider',
  summary: str(d.summary),
  includes: arr(d.includes),
})

/** Published pricing plans. Categories without a plan use the site-wide connection fee. */
export const getPlans = cache(() =>
  read('plans', async () => (await PlanModel.find({ published: true }).sort({ order: 1, name: 1 }).lean()).map((d) => toPlan(d as Lean)), () => []),
)

export const getPlan = cache(async (slug: string) => (slug ? (await getPlans()).find((p) => p.slug === slug) ?? null : null))

export function formatPlanPrice(p: Plan) {
  const price = `$${p.amount.toFixed(2)}${p.currency ? ` ${p.currency}` : ''}`
  return p.billing === 'subscription' ? `${price} / ${p.interval}` : price
}

export type PublicMapPoint = { id: string; name: string; category: string; categorySlug: string; city: string; region: string; lat: number; lng: number }

/**
 * Subscribers for the public map: published, live (active/trial) and located.
 * Coordinates are rounded to 2 decimals (~1 km) so a home address can never be read off the map.
 */
export const getPublicMapPoints = cache(() =>
  read(
    'map',
    async () => {
      const [subs, categories] = await Promise.all([
        Subscriber.find({ published: true, status: { $in: LIVE_SUBSCRIBER_STATUSES }, location: { $ne: null } }).select('name category city region location').lean(),
        getCategories(),
      ])
      const round = (n: number) => Math.round(n * 100) / 100
      return subs
        .filter((s) => s.location?.lat != null && s.location?.lng != null)
        .map((s) => {
          const cat = categories.find((c) => c.slug === s.category)
          return { id: String(s._id), name: s.name, category: cat?.name ?? '', categorySlug: cat?.slug ?? '', city: s.city ?? '', region: s.region ?? '', lat: round(s.location!.lat!), lng: round(s.location!.lng!) }
        })
    },
    (): PublicMapPoint[] => [],
  ),
)

/** The slim shape client components need — keeps long descriptions and FAQs out of the client bundle. */
/** Category lookup by its ID on the previous fleeket.com (for /ServiceCategory/:id redirects). */
export const getCategoryByLegacyId = cache(async (id: number) => (await getCategories()).find((c) => c.legacyId === id) ?? null)

export type PublicProvider = { id: string; name: string; city: string; region: string; subServices: string[]; plan: string }

/** Live, published taskers in a category (optionally one sub-service). Public fields only — no contact details. */
export const getCategoryProviders = cache((categorySlug: string, subService?: string) =>
  read(
    'providers',
    async () =>
      (
        await Subscriber.find({
          category: categorySlug,
          published: true,
          status: { $in: LIVE_SUBSCRIBER_STATUSES },
          ...(subService ? { subServices: subService } : {}),
        })
          .sort({ name: 1 })
          .select('name city region subServices plan')
          .lean()
      ).map((s) => ({ id: String(s._id), name: s.name, city: s.city ?? '', region: s.region ?? '', subServices: s.subServices ?? [], plan: s.plan ?? '' })),
    (): PublicProvider[] => [],
  ),
)

export const groupNames = (categories: Category[]) => [...new Set(categories.map((c) => c.group))]

export const formatPrice =(p: DefaultContent['pricing']) =>
  `$${Number(p.amount).toFixed(2)}${p.currency ? ` ${p.currency}` : ''}`
