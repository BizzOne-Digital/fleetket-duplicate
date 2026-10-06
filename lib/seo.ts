import 'server-only'
import type { Metadata } from 'next'
import { getContent } from './content'
import type { ContentKey } from './content-schema'

export const DEFAULT_LOCALE = 'en'

/** Canonical origin. Set NEXT_PUBLIC_SITE_URL to the live domain in production. */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  return (fromEnv || 'http://localhost:3000').replace(/\/+$/, '')
}

export const absoluteUrl = (path = '/') => `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`

type BuildArgs = {
  title: string
  description: string
  path: string
  locale?: string
  image?: string
  noIndex?: boolean
  /** Use the title as-is instead of the “%s | Fleeket” template. */
  absoluteTitle?: boolean
}

export async function buildMetadata({ title, description, path, locale = DEFAULT_LOCALE, image, noIndex, absoluteTitle }: BuildArgs): Promise<Metadata> {
  const [site, seo] = await Promise.all([getContent('site'), getContent('seo')])
  const url = absoluteUrl(path)
  const ogImage = image || seo.ogImage || '/opengraph-image'
  const ogImages = [{ url: ogImage, width: 1200, height: 630, alt: title }]

  return {
    // Titles that already name the site (e.g. an admin-entered “Contact Us | Fleeket”) skip the “%s | Fleeket” template.
    title: absoluteTitle || (site.name && title.includes(site.name)) ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      // Single-language site: declare the page itself as the English and default alternate.
      // Add per-locale URLs here only when translated content actually exists.
      languages: { [locale]: url, 'x-default': url },
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: site.name,
      locale: 'en_CA',
      alternateLocale: ['en_US'],
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      ...(seo.twitterHandle ? { site: seo.twitterHandle, creator: seo.twitterHandle } : {}),
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  }
}

/** Metadata for a CMS-backed page, with DB values falling back to bundled defaults. */
export async function generatePageMetadata(pageKey: ContentKey, path: string, locale = DEFAULT_LOCALE): Promise<Metadata> {
  const [page, seo] = await Promise.all([getContent(pageKey), getContent('seo')])
  const p = page as { seoTitle?: string; seoDescription?: string; heading?: string; title?: string }
  return buildMetadata({
    title: p.seoTitle || p.heading || p.title || seo.defaultTitle,
    description: p.seoDescription || seo.defaultDescription,
    path,
    locale,
    absoluteTitle: pageKey === 'home',
  })
}

/** For account, auth and admin pages — never indexed. */
export function noIndexMetadata(title?: string): Metadata {
  return { ...(title ? { title } : {}), robots: { index: false, follow: false, nocache: true } }
}
