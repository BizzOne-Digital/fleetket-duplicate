import Link from 'next/link'
import { Logo } from '@/components/logo'
import { CookiePreferencesButton } from '@/components/site/consent'
import { getContent } from '@/lib/content'

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { href: '/services', label: 'Services' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/cities', label: 'Areas served' },
    ],
  },
  {
    title: 'For you',
    links: [
      { href: '/for-customers', label: 'For customers' },
      { href: '/for-providers', label: 'For providers' },
      { href: '/register', label: 'Create an account' },
      { href: '/login', label: 'Sign in' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Contact' },
    ],
  },
]

export async function Footer() {
  const site = await getContent('site')
  const socials = [
    { label: 'Facebook', href: site.facebook },
    { label: 'Instagram', href: site.instagram },
    { label: 'YouTube', href: site.youtube },
    { label: 'TikTok', href: site.tiktok },
    { label: 'WhatsApp', href: site.whatsapp },
  ].filter((s) => s.href)

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-forest-950 text-fog">
      <div className="container-x pt-20 pb-10 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" aria-label="Fleeket home" className="text-cream">
              <Logo />
            </Link>
            <p className="mt-6 max-w-sm text-pretty leading-relaxed">{site.footerStatement}</p>
            <a
              href={`mailto:${site.contactEmail}`}
              className="mt-8 inline-block font-display text-2xl font-semibold tracking-[-0.03em] text-cream underline decoration-white/20 decoration-1 underline-offset-[6px] transition-colors hover:decoration-moss sm:text-3xl"
            >
              {site.contactEmail}
            </a>
            {site.phone && <p className="mt-3">{site.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-7">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="t-eyebrow text-haze">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="transition-colors hover:text-cream">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <nav aria-label="Legal">
              <p className="t-eyebrow text-haze">Legal</p>
              <ul className="mt-5 space-y-3">
                <li><Link href="/privacy" className="transition-colors hover:text-cream">Privacy Policy</Link></li>
                <li><Link href="/terms" className="transition-colors hover:text-cream">Terms &amp; Conditions</Link></li>
                <li><CookiePreferencesButton className="text-left transition-colors hover:text-cream" /></li>
              </ul>
            </nav>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none mt-20 select-none font-display text-[clamp(5rem,21vw,20rem)] font-semibold leading-[0.78] tracking-[-0.06em] text-cream/[0.06]">
          Fleeket
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.07] pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>2026 © Fleeket.com</p>
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-cream">{s.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
