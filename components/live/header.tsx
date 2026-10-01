'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/live/logo'
import { cn } from '@/lib/utils'

const TEXT_LINKS = [
  { href: '/about', label: 'Who Are We?' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/map', label: 'Providers Map' },
]

/** Fixed top bar, as on fleeket.com: text links, the two red/blue calls to action, then Sign In. */
export function LiveHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  // Pages are static, so the bar can't know who is signed in; /login forwards signed-in visitors.
  const account = { href: '/login', label: 'Sign In' }

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-brand">
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-[var(--z-header)] h-[var(--header-h)] bg-band shadow-[0_4px_10px_rgb(0_0_0/0.15)]">
        <div className="container-x flex h-full items-center justify-between">
          <Link href="/" aria-label="Fleeket home">
            <Logo className="h-[34px]" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center lg:flex">
            {TEXT_LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? 'page' : undefined}
                className={cn('px-6 text-[0.9375rem] text-brand transition-colors hover:text-brand-dark', i > 0 && 'border-l border-line', pathname === l.href && 'font-semibold')}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/become-a-tasker" className="ml-2 rounded bg-brand px-4 py-2 text-[0.9375rem] text-white shadow-sm transition-colors hover:bg-brand-light">
              Become A Tasker
            </Link>
            <Link href="/register" className="ml-2 rounded bg-member px-4 py-2 text-[0.9375rem] text-white shadow-sm transition-colors hover:bg-member-dark">
              Be Our Member
            </Link>
            <Link href={account.href} className="ml-4 px-2 text-[0.9375rem] text-brand hover:text-brand-dark">
              {account.label}
            </Link>
          </nav>

          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} className="grid size-11 place-items-center text-brand lg:hidden">
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-white shadow-lg lg:hidden">
            <ul className="container-x grid gap-1 py-3">
              {TEXT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded px-2 py-3 text-base text-brand hover:bg-panel">{l.label}</Link>
                </li>
              ))}
              <li className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/become-a-tasker" className="rounded bg-brand px-3 py-3 text-center text-white">Become A Tasker</Link>
                <Link href="/register" className="rounded bg-member px-3 py-3 text-center text-white">Be Our Member</Link>
              </li>
              <li>
                <Link href={account.href} className="block rounded px-2 py-3 text-base text-brand hover:bg-panel">{account.label}</Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  )
}
