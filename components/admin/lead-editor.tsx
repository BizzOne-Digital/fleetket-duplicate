'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { bulkLeads, updateLead } from '@/app/actions/admin'
import { ConfirmButton } from '@/components/admin/confirm'
import { adminInput } from '@/components/admin/ui'
import { Button } from '@/components/ui/button'
import { LEAD_STATUSES, type LeadStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function LeadEditor({ id, status: initialStatus, notes: initialNotes, email }: { id: string; status: string; notes: string; email: string }) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus as LeadStatus)
  const [notes, setNotes] = useState(initialNotes)
  const [pending, start] = useTransition()

  return (
    <form
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const res = await updateLead(id, { status, notes })
          res.ok ? toast.success(res.message) : toast.error(res.message)
          router.refresh()
        })
      }}
    >
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-forest-900">Status</legend>
        <div className="flex flex-wrap gap-2">
          {LEAD_STATUSES.map((s) => (
            <label
              key={s}
              className={cn(
                'cursor-pointer rounded-sm border px-3 py-1.5 text-sm capitalize transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-moss',
                status === s ? 'border-forest-900 bg-forest-900 text-cream' : 'border-forest-900/15 text-slate hover:border-forest-900/40',
              )}
            >
              <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="sr-only" />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-2">
        <label htmlFor="notes" className="text-sm font-medium text-forest-900">Internal notes</label>
        <textarea id="notes" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Calls, follow-ups, next steps…" className={cn(adminInput, 'h-auto py-2.5 leading-relaxed')} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button type="submit" variant="dark" disabled={pending}>{pending ? 'Saving…' : 'Save'}</Button>
          <a href={`mailto:${email}`} className="inline-flex h-11 items-center rounded-sm border border-forest-900/15 px-5 text-sm hover:border-forest-900/40">Reply by email</a>
        </div>
        <ConfirmButton
          title="Delete this lead?"
          body="It will be permanently removed."
          className="text-danger"
          onConfirm={async () => {
            const res = await bulkLeads([id], 'delete')
            if (!res.ok) return void toast.error(res.message)
            toast.success('Lead deleted')
            router.push('/admin/leads')
          }}
        >
          Delete lead
        </ConfirmButton>
      </div>
    </form>
  )
}
