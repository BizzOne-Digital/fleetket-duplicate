import Link from 'next/link'
import { cn } from '@/lib/utils'

export function AdminHeader({ title, description, crumbs, actions }: { title: string; description?: string; crumbs?: { label: string; href: string }[]; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 border-b border-forest-900/10 pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        {crumbs && crumbs.length > 1 && (
          <Link href={crumbs[crumbs.length - 2].href} className="mb-4 inline-flex items-center gap-1.5 rounded-md border border-forest-900/15 bg-white px-3 py-1.5 text-sm font-medium text-forest-900 transition-colors hover:bg-paper">
            <span aria-hidden>←</span> Back to {crumbs[crumbs.length - 2].label}
          </Link>
        )}
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-pebble">
            <ol className="flex flex-wrap gap-2">
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex gap-2">
                  <Link href={c.href} className="hover:text-forest-900">{c.label}</Link>
                  {i < crumbs.length - 1 && <span aria-hidden>/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.03em] text-forest-900">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-slate">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-moss/10 text-moss-700 ring-moss/20',
  contacted: 'bg-amber-500/10 text-amber-700 ring-amber-500/25',
  qualified: 'bg-violet-500/10 text-violet-700 ring-violet-500/20',
  converted: 'bg-success/10 text-emerald-700 ring-success/25',
  closed: 'bg-forest-900/5 text-slate ring-forest-900/10',
  spam: 'bg-danger/10 text-red-700 ring-danger/20',
  published: 'bg-success/10 text-emerald-700 ring-success/25',
  hidden: 'bg-forest-900/5 text-slate ring-forest-900/10',
  active: 'bg-success/10 text-emerald-700 ring-success/25',
  disabled: 'bg-danger/10 text-red-700 ring-danger/20',
}

export function Badge({ status, children }: { status: string; children?: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset', STATUS_STYLES[status] ?? STATUS_STYLES.closed)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {children ?? status}
    </span>
  )
}

export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-md border border-forest-900/10 bg-white', className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-forest-900/10 px-5 py-4">
          <h2 className="font-display font-semibold tracking-[-0.01em] text-forest-900">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span aria-hidden className="grid size-12 place-items-center rounded-md border border-dashed border-forest-900/20 text-pebble">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16M4 12h10M4 17h7" /></svg>
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-forest-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export const adminInput =
  'h-10 w-full rounded-sm border border-forest-900/15 bg-white px-3 text-sm text-forest-900 placeholder:text-pebble transition-[border-color,box-shadow] hover:border-forest-900/30 focus:border-moss focus:shadow-[0_0_0_3px_rgb(86_102_28/0.16)] focus:outline-none'

export function formatDate(d: Date | string | undefined) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d))
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
