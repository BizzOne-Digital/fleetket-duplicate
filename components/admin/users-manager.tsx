'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createUser, deleteUser, updateUser } from '@/app/actions/admin'
import { ConfirmButton } from '@/components/admin/confirm'
import { Badge, adminInput, formatDate } from '@/components/admin/ui'
import { Button } from '@/components/ui/button'
import { ROLES } from '@/lib/constants'
import { cn } from '@/lib/utils'

type UserRow = { id: string; name: string; email: string; role: string; active: boolean; createdAt: string; lastLoginAt: string | null }

export function UsersManager({ users, meId, meRole }: { users: UserRow[]; meId: string; meRole: string }) {
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const [pending, start] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<'staff' | 'all'>('staff')
  const roles = meRole === 'owner' ? ROLES : ROLES.filter((r) => r !== 'owner')

  const visible = useMemo(() => (filter === 'staff' ? users.filter((u) => ['owner', 'admin', 'editor'].includes(u.role)) : users), [users, filter])

  const act = (fn: () => Promise<{ ok: boolean; message: string; errors?: Record<string, string> }>, after?: () => void) =>
    start(async () => {
      const res = await fn()
      setErrors(res.errors ?? {})
      if (!res.ok) return void toast.error(res.message)
      toast.success(res.message)
      after?.()
      router.refresh()
    })

  return (
    <div className="rounded-md border border-forest-900/10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-900/10 p-4">
        <div role="tablist" className="flex gap-1">
          {(['staff', 'all'] as const).map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn('rounded-sm px-3 py-1.5 text-sm', filter === f ? 'bg-forest-900 text-cream' : 'text-slate hover:text-forest-900')}>
              {f === 'staff' ? 'Admin team' : `All accounts (${users.length})`}
            </button>
          ))}
        </div>
        <Button size="sm" variant="dark" onClick={() => dialog.current?.showModal()}>Add user</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-forest-900/10 text-xs uppercase tracking-[0.08em] text-pebble">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Last sign-in</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-900/10">
            {visible.map((u) => {
              const me = u.id === meId
              const locked = me || (u.role === 'owner' && meRole !== 'owner')
              return (
                <tr key={u.id} className="hover:bg-paper">
                  <td className="px-4 py-3">
                    <p className="font-medium text-forest-900">{u.name}{me && <span className="ml-2 text-xs font-normal text-pebble">(you)</span>}</p>
                    <p className="text-xs text-pebble">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <label>
                      <span className="sr-only">Role for {u.name}</span>
                      <select
                        value={u.role}
                        disabled={locked || pending}
                        onChange={(e) => act(() => updateUser(u.id, { role: e.target.value }))}
                        className="h-9 rounded-sm border border-forest-900/15 bg-white px-2 text-sm capitalize disabled:opacity-60"
                      >
                        {(locked ? ROLES : roles).map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </label>
                  </td>
                  <td className="px-4 py-3"><Badge status={u.active ? 'active' : 'disabled'} /></td>
                  <td className="hidden px-4 py-3 text-pebble md:table-cell">{u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="quiet" disabled={locked || pending} onClick={() => act(() => updateUser(u.id, { active: !u.active }))}>
                        {u.active ? 'Disable' : 'Enable'}
                      </Button>
                      <ConfirmButton title={`Delete ${u.name}?`} body="Their account and sign-in access are removed permanently." variant="quiet" className="text-danger" disabled={locked || pending} onConfirm={() => act(() => deleteUser(u.id))}>
                        Delete
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <dialog ref={dialog} className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-md border border-forest-900/10 bg-white p-0 text-forest-900 shadow-[var(--shadow-card)] backdrop:bg-forest-950/50 backdrop:backdrop-blur-sm">
        <form
          className="grid gap-4 p-6"
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const data = Object.fromEntries(new FormData(form))
            act(() => createUser(data), () => {
              form.reset()
              dialog.current?.close()
            })
          }}
        >
          <h2 className="font-display text-lg font-semibold">Add a user</h2>
          {([
            ['name', 'Full name', 'text'],
            ['email', 'Email', 'email'],
            ['password', 'Temporary password', 'password'],
          ] as const).map(([name, label, type]) => (
            <div key={name} className="grid gap-1.5">
              <label htmlFor={`u-${name}`} className="text-sm font-medium">{label}</label>
              <input id={`u-${name}`} name={name} type={type} required autoComplete={type === 'password' ? 'new-password' : 'off'} className={cn(adminInput, errors[name] && 'border-danger')} />
              {errors[name] && <p className="text-sm text-danger">{errors[name]}</p>}
            </div>
          ))}
          <div className="grid gap-1.5">
            <label htmlFor="u-role" className="text-sm font-medium">Role</label>
            <select id="u-role" name="role" defaultValue="editor" className={cn(adminInput, 'capitalize')}>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <p className="text-xs text-pebble">Share the temporary password securely. Passwords need 10+ characters with a letter and a number.</p>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => dialog.current?.close()}>Cancel</Button>
            <Button type="submit" variant="dark" size="sm" disabled={pending}>{pending ? 'Creating…' : 'Create user'}</Button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
