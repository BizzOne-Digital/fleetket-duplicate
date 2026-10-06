import type { MetadataRoute } from 'next'
import { absoluteUrl, getSiteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/account', '/login', '/api/'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: getSiteUrl(),
  }
}
