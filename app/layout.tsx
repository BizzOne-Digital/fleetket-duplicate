import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Toaster } from 'sonner'
import { getContent } from '@/lib/content'
import { getSiteUrl } from '@/lib/seo'
import './globals.css'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins', display: 'swap' })

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

export const viewport: Viewport = { themeColor: '#ec1c24' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}
