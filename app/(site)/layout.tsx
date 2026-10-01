import { Header } from '@/components/site/header'
import { Footer } from '@/components/site/footer'
import { ConsentManager } from '@/components/site/consent'
import { JsonLd } from '@/components/site/json-ld'
import { CursorHalo, SmoothScroll } from '@/components/site/experience'
import { getContent } from '@/lib/content'
import { absoluteUrl } from '@/lib/seo'

// Public pages are static and refreshed hourly; admin saves revalidate them immediately.
export const revalidate = 3600

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, seo] = await Promise.all([getContent('site'), getContent('seo')])
  const sameAs = [site.facebook, site.instagram, site.youtube, site.tiktok].filter(Boolean)

  return (
    <>
      {/* Organization + WebSite only. No LocalBusiness: Fleeket has no verified public address. Pages set their own canonical. */}
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': absoluteUrl('/#organization'),
            name: site.name,
            url: absoluteUrl('/'),
            logo: absoluteUrl('/icon.svg'),
            email: site.contactEmail,
            description: seo.defaultDescription,
            slogan: site.tagline,
            areaServed: [{ '@type': 'Country', name: 'Canada' }, { '@type': 'Country', name: 'United States' }],
            ...(sameAs.length ? { sameAs } : {}),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': absoluteUrl('/#website'),
            name: site.name,
            url: absoluteUrl('/'),
            publisher: { '@id': absoluteUrl('/#organization') },
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl('/services')}?q={search_term_string}` },
              'query-input': 'required name=search_term_string',
            },
          },
        ]}
      />
      <Header email={site.contactEmail} />
      <main id="main">{children}</main>
      <Footer />
      <ConsentManager gaId={process.env.NEXT_PUBLIC_GA_ID} />
      <SmoothScroll />
      <CursorHalo />
    </>
  )
}
