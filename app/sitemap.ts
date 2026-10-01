import type { MetadataRoute } from 'next'
import { getCategories } from '@/lib/content'
import { absoluteUrl } from '@/lib/seo'

export const revalidate = 3600

const STATIC: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, freq: 'weekly' },
  { path: '/about', priority: 0.6, freq: 'monthly' },
  { path: '/contact', priority: 0.5, freq: 'yearly' },
  { path: '/become-a-tasker', priority: 0.8, freq: 'monthly' },
  { path: '/register', priority: 0.6, freq: 'monthly' },
  { path: '/map', priority: 0.6, freq: 'weekly' },
  { path: '/privacy', priority: 0.2, freq: 'yearly' },
  { path: '/terms', priority: 0.2, freq: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories()
  const now = new Date()
  return [
    ...STATIC.map((s) => ({ url: absoluteUrl(s.path), lastModified: now, changeFrequency: s.freq, priority: s.priority })),
    ...categories.map((c) => ({ url: absoluteUrl(`/services/${c.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...categories.flatMap((c) => c.subServices.map((s) => ({ url: absoluteUrl(`/services/${c.slug}/${s.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
  ]
}
