'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { bulkLeads } from '@/app/actions/admin'
import { ConfirmButton } from '@/components/admin/confirm'
import { Badge, EmptyState, formatDate } from '@/components/admin/ui'
import { LEAD_STATUSES, LEAD_TYPE_LABELS, type LeadType } from '@/lib/constants'
import { cn } from '@/lib/utils'

type LeadRow = { id: string; name: string; email: string; type: LeadType; category: string; subject: string; status: string; createdAt: string }

export function LeadsTable({ leads, filtered }: { leads: LeadRow[]; filtered: boolean }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, start] = useTransition()
  const ids = [...selected]

  const run = (action: Parameters<typeof bulkLeads>[1]) =>
    start(async () => {
      const res = await bulkLeads(ids, action)
      res.ok ? toast.success(res.message) : toast.error(res.message)
      setSelected(new Set())
      router.refresh()
    })

  if (!leads.length) {
    return (
      <div className="rounded-md border border-forest-900/10 bg-white">
        <EmptyState title={filtered ? 'No leads match these filters' : 'No leads yet'} body={filtered ? 'Try clearing the filters or searching for something else.' : 'Every form submission on the site lands here.'} />
      </div>
    )
  }

  const all = leads.every((l) => selected.has(l.id))

  return (
    <div className="rounded-md border border-forest-900/10 bg-white">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-forest-900/10 bg-moss/[0.04] px-4 py-3" aria-live="polite">
          <span className="text-sm text-slate">{selected.size} selected</span>
          <label className="ml-2 text-sm">
            <span className="sr-only">Change status</span>
            <select
              disabled={pending}
              defaultValue=""
              onChange={(e) => e.target.value && run(e.target.value as (typeof LEAD_STATUSES)[number])}
              className="h-9 rounded-sm border border-forest-900/15 bg-white px-2 text-sm capitalize"
            >
              <option value="">Mark as…</option>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <ConfirmButton title={`Delete ${selected.size} leads?`} body="Deleted leads can’t be recovered." onConfirm={() => run('delete')} className="text-danger" disabled={pending}>
            Delete
          </ConfirmButton>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-forest-900/10 text-xs uppercase tracking-[0.08em] text-pebble">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" aria-label="Select all" checked={all} onChange={() => setSelected(all ? new Set() : new Set(leads.map((l) => l.id)))} className="size-4 accent-[var(--color-moss)]" />
              </th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">About</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-900/10">
            {leads.map((l) => (
              <tr key={l.id} className={cn('transition-colors hover:bg-paper', selected.has(l.id) && 'bg-moss/[0.04]', l.status === 'new' && 'font-medium')}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${l.name}`}
                    checked={selected.has(l.id)}
                    onChange={() => {
                      const next = new Set(selected)
                      next.has(l.id) ? next.delete(l.id) : next.add(l.id)
                      setSelected(next)
                    }}
                    className="size-4 accent-[var(--color-moss)]"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${l.id}`} className="block text-forest-900 hover:text-moss">{l.name}</Link>
                  <span className="text-xs font-normal text-pebble">{l.email}</span>
                </td>
                <td className="px-4 py-3 font-normal text-slate">{LEAD_TYPE_LABELS[l.type]}</td>
                <td className="hidden max-w-xs truncate px-4 py-3 font-normal text-slate md:table-cell">{l.category || l.subject || '—'}</td>
                <td className="px-4 py-3"><Badge status={l.status} /></td>
                <td className="hidden whitespace-nowrap px-4 py-3 font-normal text-pebble sm:table-cell">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
