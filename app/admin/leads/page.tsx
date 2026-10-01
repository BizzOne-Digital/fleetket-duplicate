import Link from 'next/link'
import type { QueryFilter } from 'mongoose'
import { AdminHeader } from '@/components/admin/ui'
import { LeadsTable } from '@/components/admin/leads-table'
import { ButtonLink, buttonVariants } from '@/components/ui/button'
import { db } from '@/lib/content'
import { Lead, type LeadDoc } from '@/lib/models'
import { LEAD_STATUSES, LEAD_TYPES, LEAD_TYPE_LABELS, isLeadStatus, isLeadType, type LeadType } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Leads & messages' }
const PAGE_SIZE = 25

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export default async function LeadsPage({ searchParams }: PageProps<'/admin/leads'>) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '')
  const q = one(sp.q).trim().slice(0, 100)
  const status = isLeadStatus(sp.status) ? sp.status : ''
  const type = isLeadType(sp.type) ? sp.type : ''
  const page = Math.max(1, Number(one(sp.page)) || 1)

  const filter: QueryFilter<LeadDoc> = {}
  if (status) filter.status = status
  if (type) filter.type = type
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i')
    filter.$or = [{ name: rx }, { email: rx }, { business: rx }, { subject: rx }, { category: rx }]
  }

  await db()
  const [total, leads, counts] = await Promise.all([
    Lead.countDocuments(filter),
    Lead.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Lead.aggregate<{ _id: string; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const href = (patch: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...(q && { q }), ...(status && { status }), ...(type && { type }) })
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, String(v)) : p.delete(k)))
    if (!('page' in patch)) p.delete('page')
    return `/admin/leads${p.size ? `?${p}` : ''}`
  }

  return (
    <div className="grid gap-6">
      <AdminHeader
        title="Leads & messages"
        description="Contact messages, service requests and provider listing requests from every form on the site."
        actions={
          <a href={`/api/admin/leads/export${status || type ? `?${new URLSearchParams({ ...(status && { status }), ...(type && { type }) })}` : ''}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Export CSV
          </a>
        }
      />

      <nav aria-label="Filter by status" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-forest-900/10">
        {['', ...LEAD_STATUSES].map((s) => {
          const n = s ? counts.find((c) => c._id === s)?.n ?? 0 : counts.reduce((a, c) => a + c.n, 0)
          return (
            <Link
              key={s || 'all'}
              href={href({ status: s })}
              aria-current={status === s ? 'page' : undefined}
              className={cn('-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm capitalize transition-colors', status === s ? 'border-moss text-forest-900' : 'border-transparent text-slate hover:text-forest-900')}
            >
              {s || 'All'} <span className="ml-1 tabular-nums text-pebble">{n}</span>
            </Link>
          )
        })}
      </nav>

      <form className="flex flex-col gap-3 sm:flex-row" action="/admin/leads">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="flex-1">
          <span className="sr-only">Search leads</span>
          <input name="q" defaultValue={q} placeholder="Search name, email, business, subject…" className="h-10 w-full rounded-sm border border-forest-900/15 bg-white px-3 text-sm focus:border-moss focus:outline-none" />
        </label>
        <label>
          <span className="sr-only">Source</span>
          <select name="type" defaultValue={type} className="h-10 rounded-sm border border-forest-900/15 bg-white px-3 text-sm focus:border-moss focus:outline-none">
            <option value="">All sources</option>
            {LEAD_TYPES.map((t) => <option key={t} value={t}>{LEAD_TYPE_LABELS[t as LeadType]}</option>)}
          </select>
        </label>
        <button type="submit" className="h-10 rounded-sm bg-forest-900 px-5 text-sm font-medium text-cream hover:bg-forest-700">Filter</button>
      </form>

      <LeadsTable
        leads={leads.map((l) => ({
          id: String(l._id),
          name: l.name,
          email: l.email,
          type: l.type as LeadType,
          category: l.category ?? '',
          subject: l.subject ?? '',
          status: l.status,
          createdAt: l.createdAt.toISOString(),
        }))}
        filtered={Boolean(q || status || type)}
      />

      {pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
          <p className="text-slate">Page {page} of {pages} · {total} leads</p>
          <div className="flex gap-2">
            {page > 1 && <ButtonLink href={href({ page: page - 1 })} variant="outline" size="sm">Previous</ButtonLink>}
            {page < pages && <ButtonLink href={href({ page: page + 1 })} variant="outline" size="sm">Next</ButtonLink>}
          </div>
        </nav>
      )}
    </div>
  )
}
