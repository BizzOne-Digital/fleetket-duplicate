import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Backdrop } from '@/components/site/sections'
import { ButtonLink } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-forest-900">
      <Backdrop />
      <div className="container-x relative py-8">
        <Link href="/" aria-label="Fleeket home" className="text-cream"><Logo /></Link>
      </div>
      <div className="container-x relative flex flex-1 flex-col justify-center pb-24">
        <p className="t-eyebrow text-lime">404 · Page not found</p>
        <h1 className="t-display mt-6 max-w-[12ch] text-cream">This page has moved on.</h1>
        <p className="t-lead mt-6 max-w-lg text-fog">The link may be outdated or the page may have been renamed. Let’s get you somewhere useful.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/" size="lg" variant="light" arrow>Back to home</ButtonLink>
          <ButtonLink href="/services" size="lg" variant="outline" className="text-cream">Explore services</ButtonLink>
        </div>
      </div>
    </main>
  )
}
