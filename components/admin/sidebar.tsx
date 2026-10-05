'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BadgeDollarSign, CreditCard, Megaphone, FileText, Gauge, HelpCircle, Image as ImageIcon, Inbox, LayoutGrid, LogOut, Map as MapIcon, MapPinned, Menu, Scale, Settings, Store, Ticket, Users, X,
} from 'lucide-react'
import { logout } from '@/app/actions/public'
import { Logo } from '@/components/live/logo'
import { cn } from '@/lib/utils'

const GROUPS = [
  { label: 'Overview', items: [{ href: '/admin', label: 'Dashboard', icon: Gauge, exact: true }, { href: '/admin/leads', label: 'Leads & messages', icon: Inbox, badge: 'leads' }] },
  {
    label: 'Subscribers & ads',
    items: [
      { href: '/admin/subscribers', label: 'Subscribers', icon: Store },
      { href: '/admin/listings', label: 'Ads', icon: Megaphone, badge: 'ads' },
      { href: '/admin/map', label: 'Subscriber map', icon: MapIcon },
      { href: '/admin/plans', label: 'Pricing plans', icon: CreditCard },
      { href: '/admin/promoCodes', label: 'Promo codes', icon: Ticket },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/categories', label: 'Service categories', icon: LayoutGrid },
      { href: '/admin/cities', label: 'Areas served', icon: MapPinned },
      { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
      { href: '/admin/pages', label: 'Pages', icon: FileText },
      { href: '/admin/content/pricing', label: 'Pricing page', icon: BadgeDollarSign },
      { href: '/admin/legal', label: 'Legal', icon: Scale },
      { href: '/admin/media', label: 'Media library', icon: ImageIcon },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users, manage: true },
      { href: '/admin/settings', label: 'Site & SEO settings', icon: Settings, manage: true },
    ],
  },
]

export function AdminSidebar({ user, badges, canManage }: { user: { name: string; email: string; role: string }; badges: Record<string, number>; canManage: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-7 overflow-y-auto px-3 py-6">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-haze">{g.label}</p>
          <ul className="mt-2 grid gap-0.5">
            {g.items
              .filter((i) => !('manage' in i && i.manage) || canManage)
              .map((item) => {
                const active = isActive(item.href, 'exact' in item && item.exact === true)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors',
                        active ? 'bg-white/[0.08] text-cream' : 'text-fog hover:bg-white/[0.04] hover:text-cream',
                      )}
                    >
                      <Icon aria-hidden className="size-4" strokeWidth={1.6} />
                      <span className="flex-1">{item.label}</span>
                      {'badge' in item && badges[item.badge ?? ''] > 0 && (
                        <span className="rounded-sm bg-lime px-1.5 py-0.5 text-[0.6875rem] font-semibold text-forest-900">{badges[item.badge ?? '']}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </nav>
  )

  const footer = (
    <div className="border-t border-white/[0.07] p-4">
      <p className="truncate text-sm text-cream">{user.name}</p>
      <p className="truncate text-xs text-haze">{user.email} · <span className="capitalize">{user.role}</span></p>
      <div className="mt-3 flex gap-2">
        <Link href="/" target="_blank" className="flex-1 rounded-sm border border-white/10 px-3 py-2 text-center text-xs text-fog hover:text-cream">View site ↗</Link>
        <form action={logout}>
          <button type="submit" className="flex items-center gap-1.5 rounded-sm border border-white/10 px-3 py-2 text-xs text-fog hover:text-cream">
            <LogOut aria-hidden className="size-3.5" /> Sign out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.07] bg-forest-950 px-4 text-cream lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-display font-semibold"><Logo className="h-7" /> Admin</Link>
        <button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="grid size-10 place-items-center">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 top-14 z-40 flex flex-col bg-forest-950 lg:hidden">
          {nav}
          {footer}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-forest-950 lg:flex">
        <Link href="/admin" className="flex h-16 items-center gap-2.5 border-b border-white/[0.07] px-6 font-display text-[1.0625rem] font-semibold tracking-[-0.02em] text-cream">
          <Logo className="h-8" /> <span className="font-sans text-xs font-medium text-haze">Admin</span>
        </Link>
        {nav}
        {footer}
      </aside>
    </>
  )
}
