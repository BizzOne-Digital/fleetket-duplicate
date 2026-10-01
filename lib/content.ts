import 'server-only'
import { cache } from 'react'
import { connectDb, isDbConfigured } from './db'
import { Category as CategoryModel, City, Content, Faq, User } from './models'
import { DEFAULT_CATEGORIES, DEFAULT_CITIES, DEFAULT_CONTENT, DEFAULT_FAQS, type CategorySeed, type DefaultContent } from './defaults'
import { hashPassword } from './auth'
import type { ContentKey } from './content-schema'

export type Category = Required<CategorySeed> & { id: string; seoTitle: string; seoDescription: string; published: boolean; order: number }
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

async function seed() {
  const flag = await Content.findOne({ key: '__seeded' }).lean()
  if (!flag) {
    await CategoryModel.insertMany(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, order: i, published: true })), { ordered: false }).catch(() => {})
    await City.insertMany(DEFAULT_CITIES.map((c, i) => ({ ...c, country: 'CA', order: i, published: true })), { ordered: false }).catch(() => {})
    await Faq.insertMany(DEFAULT_FAQS.map((f, i) => ({ ...f, order: i, published: true })), { ordered: false }).catch(() => {})
    await Content.bulkWrite(
      Object.entries(DEFAULT_CONTENT).map(([key, value]) => ({
        updateOne: { filter: { key }, update: { $setOnInsert: { key, value } }, upsert: true },
      })),
    )
    await Content.create({ key: '__seeded', value: { at: new Date().toISOString() } })
  }

  // Bootstrap the first owner account from env, only while no administrator exists.
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD
  if (email && password && password.length >= 10) {
    const hasAdmin = await User.exists({ role: { $in: ['owner', 'admin'] } })
    if (!hasAdmin) {
      await User.create({ name: 'Fleeket Admin', email, passwordHash: await hashPassword(password), role: 'owner' })
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
  return {
    id: String(d._id),
    name: str(d.name),
    slug: str(d.slug),
    group: str(d.group),
    icon: str(d.icon) || 'sparkles',
    shortDescription: str(d.shortDescription),
    description: str(d.description),
    image: str(d.image),
    imageAlt: str(d.imageAlt),
    needs: arr(d.needs),
    serviceTypes: arr(d.serviceTypes),
    faqs: Array.isArray(d.faqs) ? (d.faqs as { q: string; a: string }[]).map(({ q, a }) => ({ q, a })) : [],
    featured: Boolean(d.featured),
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

/** The slim shape client components need — keeps long descriptions and FAQs out of the client bundle. */
export const toSearchCategory = ({ name, slug, icon, group, shortDescription, image, serviceTypes, featured }: Category) => ({
  name, slug, icon, group, shortDescription, image, serviceTypes, featured,
})

export const groupNames = (categories: Category[]) => [...new Set(categories.map((c) => c.group))]

export const formatPrice =(p: DefaultContent['pricing']) =>
  `$${Number(p.amount).toFixed(2)}${p.currency ? ` ${p.currency}` : ''}`
