import type { Metadata, Viewport } from 'next'
import { Instrument_Sans, Instrument_Serif, Manrope } from 'next/font/google'
import { Providers } from '@/components/providers'
import { getContent } from '@/lib/content'
import { getSiteUrl } from '@/lib/seo'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const instrument = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument', display: 'swap' })
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', variable: '--font-instrument-serif', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const [seo, site] = await Promise.all([getContent('seo'), getContent('site')])
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: seo.defaultTitle, template: `%s | ${site.name}` },
    description: seo.defaultDescription,
    keywords: seo.keywords,
    applicationName: site.name,
    authors: [{ name: site.name }],
    formatDetection: { telephone: false, email: false, address: false },
    icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }] },
  }
}

export const viewport: Viewport = {
  themeColor: '#26352e',
  colorScheme: 'dark',
}

// Marks the splash as already played this session before first paint, so it never replays on navigation.
const splashScript = `try{if(sessionStorage.getItem('fk-splash'))document.documentElement.classList.add('splash-seen');else sessionStorage.setItem('fk-splash','1')}catch(e){}`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${instrument.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
