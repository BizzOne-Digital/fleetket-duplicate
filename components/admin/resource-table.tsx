'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, Eye, EyeOff, Search } from 'lucide-react'
import { deleteResources, moveResource, setPublished } from '@/app/actions/admin'
import { ConfirmButton } from '@/components/admin/confirm'
import { Badge, EmptyState, adminInput } from '@/components/admin/ui'
import { Button, ButtonLink } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type Row = { id: string; published: boolean; cells: string[]; search: string; publicHref?: string }

export function ResourceTable({ resource, columns, rows, singular }: { resource: string; columns: string[]; rows: Row[]; singular: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, start] = useTransition()

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? rows.filter((r) => r.search.includes(q)) : rows
  }, [rows, query])

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const res = await fn()
      res.ok ? toast.success(res.message) : toast.error(res.message)
      setSelected(new Set())
      router.refresh()
    })

  const allChecked = visible.length > 0 && visible.every((r) => selected.has(r.id))
  const ids = [...selected]

  return (
    <div className="rounded-md border border-forest-900/10 bg-white">
      <div className="flex flex-col gap-3 border-b border-forest-900/10 p-4 md:flex-row md:items-center md:justify-between">
        <label className="relative md:w-80">
          <span className="sr-only">Search</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-pebble" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className={cn(adminInput, 'pl-9')} />
        </label>
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2" aria-live="polite">
            <span className="text-sm text-slate">{selected.size} selected</span>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setPublished(resource, ids, true))}>Publish</Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setPublished(resource, ids, false))}>Hide</Button>
            <ConfirmButton
              title={`Delete ${selected.size} ${selected.size === 1 ? singular.toLowerCase() : 'items'}?`}
              body="This permanently removes them from the site and the database. Uploaded images used only by these items are deleted too."
              onConfirm={() => run(() => deleteResources(resource, ids))}
              className="text-danger"
            >
              Delete
            </ConfirmButton>
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={query ? 'No matches' : `No ${singular.toLowerCase()} items yet`}
          body={query ? 'Try a different search.' : `Create the first ${singular.toLowerCase()} to show it on the site.`}
          action={!query && <ButtonLink href={`/admin/${resource}/new`} variant="dark" size="sm">New {singular.toLowerCase()}</ButtonLink>}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-forest-900/10 text-xs uppercase tracking-[0.08em] text-pebble">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allChecked}
                    onChange={() => setSelected(allChecked ? new Set() : new Set(visible.map((r) => r.id)))}
                    className="size-4 accent-[var(--color-moss)]"
                  />
                </th>
                {columns.map((c) => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-900/10">
              {visible.map((r, i) => (
                <tr key={r.id} className={cn('transition-colors hover:bg-paper', selected.has(r.id) && 'bg-moss/[0.04]')}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.cells[0]}`}
                      checked={selected.has(r.id)}
                      onChange={() => {
                        const next = new Set(selected)
                        next.has(r.id) ? next.delete(r.id) : next.add(r.id)
                        setSelected(next)
                      }}
                      className="size-4 accent-[var(--color-moss)]"
                    />
                  </td>
                  {r.cells.map((cell, ci) => (
                    <td key={ci} className={cn('px-4 py-3', ci === 0 ? 'font-medium text-forest-900' : 'text-slate')}>
                      {ci === 0 ? <Link href={`/admin/${resource}/${r.id}`} className="hover:text-moss">{cell}</Link> : cell}
                    </td>
                  ))}
                  <td className="px-4 py-3"><Badge status={r.published ? 'published' : 'hidden'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!query && (
                        <>
                          <IconAction label="Move up" disabled={pending || i === 0} onClick={() => run(() => moveResource(resource, r.id, 'up'))}><ArrowUp className="size-4" /></IconAction>
                          <IconAction label="Move down" disabled={pending || i === visible.length - 1} onClick={() => run(() => moveResource(resource, r.id, 'down'))}><ArrowDown className="size-4" /></IconAction>
                        </>
                      )}
                      <IconAction label={r.published ? 'Hide from site' : 'Publish'} disabled={pending} onClick={() => run(() => setPublished(resource, [r.id], !r.published))}>
                        {r.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </IconAction>
                      <Link href={`/admin/${resource}/${r.id}`} className="ml-1 rounded-sm px-2.5 py-1.5 text-sm font-medium text-moss hover:bg-moss/5">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function IconAction({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="grid size-8 place-items-center rounded-sm text-slate transition-colors hover:bg-forest-900/5 hover:text-forest-900 disabled:opacity-30">
      {children}
    </button>
  )
}
