import 'server-only'
import type { Model } from 'mongoose'
import { Category, City, Faq } from './models'
import type { ResourceKey } from './resources'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RESOURCE_MODELS: Record<ResourceKey, Model<any>> = { categories: Category, cities: City, faqs: Faq }
