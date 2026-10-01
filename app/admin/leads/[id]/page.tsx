import { notFound } from 'next/navigation'
import { isValidObjectId } from 'mongoose'
import { AdminHeader, Badge, Panel, formatDate } from '@/components/admin/ui'
import { LeadEditor } from '@/components/admin/lead-editor'
import { db } from '@/lib/content'
import { Lead } from '@/lib/models'
import { LEAD_TYPE_LABELS, type LeadType } from '@/lib/constants'

export const metadata = { title: 'Lead' }

export default async function LeadDetailPage({ params }: PageProps<'/admin/leads/[id]'>) {
  const { id } = await params
  if (!isValidObjectId(id)) notFound()
  await db()
  const lead = await Lead.findById(id).lean()
  if (!lead) notFound()

  const details = [
    ['Email', lead.email ? <a key="e" href={`mailto:${lead.email}`} className="text-moss hover:underline">{lead.email}</a> : '—'],
    ['Phone', lead.phone ? <a key="p" href={`tel:${lead.phone}`} className="text-moss hover:underline">{lead.phone}</a> : '—'],
    ['Business', lead.business || '—'],
    ['Reason', lead.reason || '—'],
    ['Category', lead.category || '—'],
    ['Area', lead.area || '—'],
    ['Submitted from', lead.sourcePage || '—'],
    ['Consent given', lead.consent ? 'Yes' : 'No'],
    ['Received', formatDate(lead.createdAt)],
    ['Last updated', formatDate(lead.updatedAt)],
  ] as const

  return (
    <div className="grid gap-8">
      <AdminHeader
        title={lead.name}
        description={`${LEAD_TYPE_LABELS[lead.type as LeadType]}${lead.subject ? ` · ${lead.subject}` : ''}`}
        crumbs={[{ label: 'Leads', href: '/admin/leads' }, { label: lead.name, href: `/admin/leads/${id}` }]}
        actions={<Badge status={lead.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Panel title="Message">
            <p className="whitespace-pre-wrap px-5 py-5 leading-relaxed text-forest-900">{lead.message || <span className="text-pebble">No message provided.</span>}</p>
          </Panel>
          <Panel title="Follow-up">
            <div className="p-5">
              <LeadEditor id={id} status={lead.status} notes={lead.notes ?? ''} email={lead.email} />
            </div>
          </Panel>
        </div>
        <Panel title="Details">
          <dl className="divide-y divide-forest-900/10 text-sm">
            {details.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8rem_1fr] gap-3 px-5 py-3">
                <dt className="text-pebble">{k}</dt>
                <dd className="break-words text-forest-900">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </div>
  )
}
