import Link from 'next/link'
import { AdminHeader, Badge, EmptyState, Panel, formatDate } from '@/components/admin/ui'
import { ButtonLink } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/content'
import { Category, City, Faq, Lead, StoredUpload, Subscriber, User } from '@/lib/models'
import { isEmailConfigured } from '@/lib/email'
import { LEAD_TYPE_LABELS, type LeadType } from '@/lib/constants'

export const metadata = { title: 'Dashboard' }

export default async function AdminDashboard() {
  const user = await requireAdmin()
  await db()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [newLeads, weekLeads, totalLeads, byType, categories, hiddenCategories, areas, faqs, media, users, recent, liveSubscribers, pendingTaskers] = await Promise.all([
    Lead.countDocuments({ status: 'new' }),
    Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
    Lead.countDocuments(),
    Lead.aggregate<{ _id: LeadType; n: number }>([{ $group: { _id: '$type', n: { $sum: 1 } } }]),
    Category.countDocuments({ published: true }),
    Category.countDocuments({ published: false }),
    City.countDocuments({ published: true }),
    Faq.countDocuments({ published: true }),
    StoredUpload.countDocuments(),
    User.countDocuments(),
    Lead.find().sort({ createdAt: -1 }).limit(6).lean(),
    Subscriber.countDocuments({ status: { $in: ['active', 'trial'] } }),
    Subscriber.countDocuments({ status: 'pending' }),
  ])

  const stats = [
    { label: 'New leads', value: newLeads, href: '/admin/leads?status=new', accent: newLeads > 0 },
    { label: 'Leads this week', value: weekLeads, href: '/admin/leads' },
    { label: 'Published categories', value: categories, href: '/admin/categories', note: hiddenCategories ? `${hiddenCategories} hidden` : undefined },
    { label: 'Active subscribers', value: liveSubscribers, href: '/admin/subscribers', accent: pendingTaskers > 0, note: pendingTaskers ? `${pendingTaskers} tasker sign-up${pendingTaskers === 1 ? '' : 's'} awaiting approval` : `${areas} areas served` },
  ]

  return (
    <div className="grid gap-8">
      <AdminHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        description="What needs attention across leads and site content."
        actions={<ButtonLink href="/admin/leads?status=new" variant="dark" size="sm" arrow>Review new leads</ButtonLink>}
      />

      {!isEmailConfigured && (
        <div role="status" className="rounded-md border border-amber-500/30 bg-amber-500/[0.07] px-5 py-4 text-sm text-forest-900">
          <strong className="font-semibold">Email notifications are off.</strong> Leads are saved here, but no email alerts are sent until SMTP settings are added to the environment (see README).
        </div>
      )}

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-forest-900/10 bg-forest-900/10 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group bg-white p-5 transition-colors hover:bg-paper">
            <p className="text-sm text-slate">{s.label}</p>
            <p className={`mt-3 font-display text-4xl font-semibold tracking-[-0.04em] ${s.accent ? 'text-moss' : 'text-forest-900'}`}>{s.value}</p>
            {s.note && <p className="mt-1 text-xs text-pebble">{s.note}</p>}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Latest leads" action={<Link href="/admin/leads" className="text-sm text-moss hover:underline">View all</Link>} className="lg:col-span-2">
          {recent.length ? (
            <ul className="divide-y divide-forest-900/10">
              {recent.map((l) => (
                <li key={String(l._id)}>
                  <Link href={`/admin/leads/${l._id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-paper">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-forest-900">{l.name} <span className="font-normal text-pebble">· {l.email}</span></p>
                      <p className="truncate text-sm text-slate">{LEAD_TYPE_LABELS[l.type as LeadType]}{l.category ? ` · ${l.category}` : ''}{l.subject ? ` · ${l.subject}` : ''}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <Badge status={l.status} />
                      <p className="mt-1 text-xs text-pebble">{formatDate(l.createdAt)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No leads yet" body="Contact messages, service requests and provider listing requests will appear here as they arrive." />
          )}
        </Panel>

        <div className="grid gap-6">
          <Panel title="Leads by source">
            <ul className="divide-y divide-forest-900/10 text-sm">
              {(Object.keys(LEAD_TYPE_LABELS) as LeadType[]).map((t) => (
                <li key={t} className="flex justify-between px-5 py-3">
                  <Link href={`/admin/leads?type=${t}`} className="text-slate hover:text-forest-900">{LEAD_TYPE_LABELS[t]}</Link>
                  <span className="font-medium tabular-nums">{byType.find((b) => b._id === t)?.n ?? 0}</span>
                </li>
              ))}
              <li className="flex justify-between px-5 py-3 font-medium"><span>Total</span><span className="tabular-nums">{totalLeads}</span></li>
            </ul>
          </Panel>
          <Panel title="Content">
            <ul className="divide-y divide-forest-900/10 text-sm">
              {[
                ['Published FAQs', faqs, '/admin/faqs'],
                ['Media files', media, '/admin/media'],
                ['User accounts', users, '/admin/users'],
              ].map(([label, n, href]) => (
                <li key={String(label)} className="flex justify-between px-5 py-3">
                  <Link href={String(href)} className="text-slate hover:text-forest-900">{label}</Link>
                  <span className="font-medium tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
