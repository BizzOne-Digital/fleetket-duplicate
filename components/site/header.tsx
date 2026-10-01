'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Logo } from '@/components/logo'
import { ButtonLink } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/for-providers', label: 'For providers' },
]

const MOBILE_EXTRA = [
  { href: '/for-customers', label: 'For customers' },
  { href: '/cities', label: 'Areas served' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export function Header({ email }: { email: string }) {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // The bar is always visible; scrolling only switches it from transparent to solid.
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24))

  // Close the menu on navigation; lock scroll while it is open.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (open) window.fkLenis?.stop()
    else window.fkLenis?.start()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`))
  // Over the photo heroes the bar is transparent with cream type; once scrolled it becomes a frosted cream bar.
  const solid = scrolled && !open

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-cream focus:px-4 focus:py-2 focus:text-forest-900">
        Skip to content
      </a>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[var(--z-header)] transition-[background-color,border-color] duration-500 ease-[var(--ease-out-expo)]',
          solid ? 'border-b border-sage/80 bg-cream/85 backdrop-blur-xl backdrop-saturate-150' : 'border-b border-transparent',
        )}
      >
        <div className={cn('container-x flex items-center justify-between transition-[height] duration-500', scrolled ? 'h-16' : 'h-[var(--header-h)]')}>
          <Link href="/" aria-label="Fleeket home" className={cn('relative z-10 transition-colors duration-500', solid ? 'text-forest-900' : 'text-cream')}>
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'relative px-3.5 py-2 text-[0.9375rem] transition-colors duration-300',
                      solid
                        ? isActive(item.href) ? 'text-forest-900' : 'text-slate hover:text-forest-900'
                        : isActive(item.href) ? 'text-cream' : 'text-cream/70 hover:text-cream',
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        'absolute inset-x-3.5 -bottom-px h-[2px] origin-left transition-transform duration-500 ease-[var(--ease-out-expo)]',
                        solid ? 'bg-moss' : 'bg-lime',
                        isActive(item.href) ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className={cn('hidden px-3 py-2 text-[0.9375rem] transition-colors md:block', solid ? 'text-slate hover:text-forest-900' : 'text-cream/70 hover:text-cream')}>
              Sign in
            </Link>
            <ButtonLink href="/services" variant={solid ? 'dark' : 'primary'} size="sm" className="hidden sm:inline-flex" arrow>
              Find a service
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className={cn('relative z-10 -mr-2 grid size-11 place-items-center transition-colors lg:hidden', solid ? 'text-forest-900' : 'text-cream')}
            >
              <span className="relative block h-3 w-6">
                <span className={cn('absolute left-0 top-0 h-px w-6 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]', open && 'translate-y-1.5 rotate-45')} />
                <span className={cn('absolute bottom-0 left-0 h-px w-6 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]', open && '-translate-y-1.5 -rotate-45')} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[49] flex flex-col bg-forest-950 pt-[var(--header-h)] lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Mobile" className="container-x flex-1 overflow-y-auto py-8">
              <ul>
                {[...NAV, ...MOBILE_EXTRA].map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.04 }}
                    className="border-b border-white/[0.07]"
                  >
                    <Link
                      href={item.href}
                      className={cn('flex items-baseline justify-between py-4 font-display text-[1.75rem] font-semibold tracking-[-0.03em]', isActive(item.href) ? 'text-cream' : 'text-mist/85')}
                    >
                      {item.label}
                      <span className="t-index text-haze">{String(i + 1).padStart(2, '0')}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="container-x grid gap-3 border-t border-white/[0.07] py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="grid grid-cols-2 gap-3">
                <ButtonLink href="/services" variant="light">Find a service</ButtonLink>
                <ButtonLink href="/login" variant="outline">Sign in</ButtonLink>
              </div>
              <a href={`mailto:${email}`} className="text-sm text-fog">{email}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
