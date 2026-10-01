import type { MetadataRoute } from 'next'
import { getAreas, getCategories } from '@/lib/content'
import { absoluteUrl } from '@/lib/seo'

export const revalidate = 3600

const STATIC: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, freq: 'weekly' },
  { path: '/services', priority: 0.9, freq: 'weekly' },
  { path: '/how-it-works', priority: 0.7, freq: 'monthly' },
  { path: '/pricing', priority: 0.8, freq: 'monthly' },
  { path: '/for-providers', priority: 0.8, freq: 'monthly' },
  { path: '/for-customers', priority: 0.7, freq: 'monthly' },
  { path: '/cities', priority: 0.7, freq: 'monthly' },
  { path: '/about', priority: 0.6, freq: 'monthly' },
  { path: '/faq', priority: 0.6, freq: 'monthly' },
  { path: '/contact', priority: 0.5, freq: 'yearly' },
  { path: '/privacy', priority: 0.2, freq: 'yearly' },
  { path: '/terms', priority: 0.2, freq: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, areas] = await Promise.all([getCategories(), getAreas()])
  const now = new Date()
  return [
    ...STATIC.map((s) => ({ url: absoluteUrl(s.path), lastModified: now, changeFrequency: s.freq, priority: s.priority })),
    ...categories.map((c) => ({ url: absoluteUrl(`/services/${c.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...areas.map((a) => ({ url: absoluteUrl(`/cities/${a.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]
}
