import 'server-only'
import type { Model } from 'mongoose'
import { Category, City, Faq, Listing, Plan, PromoCode, Subscriber } from './models'
import type { ResourceKey } from './resources'
import type { FieldSpec } from './fields'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RESOURCE_MODELS: Record<ResourceKey, Model<any>> = { categories: Category, cities: City, faqs: Faq, plans: Plan, subscribers: Subscriber, listings: Listing, promoCodes: PromoCode }

/** Fill `reference` fields with the current items of the resource they point at. */
export async function withReferenceOptions(fields: FieldSpec[]): Promise<FieldSpec[]> {
  return Promise.all(
    fields.map(async (f) => {
      if (f.type !== 'reference') return f
      const items = await RESOURCE_MODELS[f.resource].find().sort({ order: 1, name: 1 }).select('name slug').lean<{ name: string; slug: string }[]>()
      return { ...f, options: items.map((i) => ({ value: i.slug, label: i.name })) }
    }),
  )
}

/** Returns the first `reference` field whose chosen slug no longer exists, if any. */
export async function findBrokenReference(fields: FieldSpec[], data: Record<string, unknown>) {
  for (const f of fields) {
    if (f.type === 'reference' && data[f.name] && !(await RESOURCE_MODELS[f.resource].exists({ slug: data[f.name] }))) return f.name
  }
  return null
}
