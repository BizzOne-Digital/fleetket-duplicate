import Link from 'next/link'
import { Logo } from '@/components/live/logo'

export default function NotFound() {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-band px-4 text-center">
      <div>
        <Link href="/" aria-label="Fleeket home" className="inline-block"><Logo className="h-12" /></Link>
        <p className="mt-8 text-[4rem] font-bold leading-none text-brand">404</p>
        <h1 className="mt-2 text-[1.75rem] font-bold text-ink">Page not found</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">The link may be outdated or the page may have moved.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded bg-brand-light px-6 py-2.5 text-white hover:bg-brand">Back to home</Link>
          <Link href="/#services" className="rounded border border-brand px-6 py-2.5 text-brand hover:bg-brand hover:text-white">Fleeket Services</Link>
        </div>
      </div>
    </main>
  )
}
