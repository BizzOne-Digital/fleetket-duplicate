import Link from 'next/link'
import { AtSign } from 'lucide-react'
import { SocialIcon } from '@/components/live/social-icons'
import { CookiePreferencesButton } from '@/components/site/consent'
import { getContent } from '@/lib/content'

export async function LiveFooter() {
  const site = await getContent('site')
  const socials = [
    { label: 'Facebook', href: site.facebook },
    { label: 'WhatsApp', href: site.whatsapp },
    { label: 'YouTube', href: site.youtube },
    { label: 'Instagram', href: site.instagram },
    { label: 'TikTok', href: site.tiktok },
  ].filter((s) => s.href)

  return (
    <footer>
      <div className="bg-ink py-4 text-[0.8125rem] text-white">
        <div className="container-x">
          <div className="max-w-[46rem] py-4">
            <h2 className="text-[1.875rem] font-bold leading-tight text-line">About {site.name}.com</h2>
            <p className="mt-3 leading-relaxed">{site.footerStatement}</p>
            <a href={`mailto:${site.contactEmail}`} className="mt-3 inline-flex items-center gap-2.5 hover:underline">
              <AtSign aria-hidden className="size-5" strokeWidth={1.75} />
              {site.contactEmail}
            </a>
          </div>
        </div>
      </div>
      <div className="bg-brand py-4 text-[0.8125rem] text-white">
        <div className="container-x flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>2026 © All rights reserved. Fleeket.com</p>
          <ul className="flex flex-wrap items-center gap-y-2">
            <li className="pr-2"><Link href="/terms" className="hover:underline">Terms &amp; Conditions</Link></li>
            <li className="border-l border-white/70 px-2"><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li className="border-l border-white/70 px-2"><CookiePreferencesButton className="hover:underline" /></li>
            {socials.map((s) => (
              <li key={s.label} className="pl-3">
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Fleeket on ${s.label}`} className="block transition-opacity hover:opacity-80">
                  <SocialIcon name={s.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
