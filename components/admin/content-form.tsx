'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageField } from '@/components/admin/image-field'
import { LocationField } from '@/components/admin/location-field'
import { adminInput } from '@/components/admin/ui'
import { emptyValueFor, type FieldSpec, type LatLng } from '@/lib/fields'
import type { UploadFolder } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Values = Record<string, unknown>
type Result = { ok: boolean; message: string; errors?: Record<string, string>; id?: string }

function Label({ htmlFor, children, help }: { htmlFor?: string; children: React.ReactNode; help?: string }) {
  return (
    <div className="grid gap-0.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-forest-900">{children}</label>
      {help && <span className="text-xs text-pebble">{help}</span>}
    </div>
  )
}

function FieldInput({ field, value, onChange, path, errors, folder }: { field: FieldSpec; value: unknown; onChange: (v: unknown) => void; path: string; errors: Record<string, string>; folder: UploadFolder }) {
  const err = errors[path]
  const id = `f-${path}`
  const errorEl = err && <p className="text-sm text-danger">{err}</p>

  switch (field.type) {
    case 'text':
    case 'number':
      return (
        <div className="grid gap-2">
          <Label htmlFor={id} help={field.help}>{field.label}</Label>
          <input
            id={id}
            type={field.type}
            step={field.type === 'number' ? field.step : undefined}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!err}
            className={cn(adminInput, err && 'border-danger')}
          />
          {errorEl}
        </div>
      )
    case 'textarea':
      return (
        <div className="grid gap-2">
          <Label htmlFor={id} help={field.help}>{field.label}</Label>
          <textarea
            id={id}
            rows={field.rows ?? 4}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!err}
            className={cn(adminInput, 'h-auto py-2.5 leading-relaxed', err && 'border-danger')}
          />
          {errorEl}
        </div>
      )
    case 'select':
      return (
        <div className="grid gap-2">
          <Label htmlFor={id} help={field.help}>{field.label}</Label>
          <select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className={cn(adminInput, 'cursor-pointer')}>
            {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {errorEl}
        </div>
      )
    case 'checkbox':
      return (
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-forest-900">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--color-moss)]" />
          {field.label}
        </label>
      )
    case 'reference':
      return (
        <div className="grid gap-2">
          <Label htmlFor={id} help={field.help}>{field.label}</Label>
          <select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} aria-invalid={!!err} className={cn(adminInput, 'cursor-pointer', err && 'border-danger')}>
            <option value="">{field.emptyLabel ?? 'None'}</option>
            {(field.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errorEl}
        </div>
      )
    case 'location':
      return <LocationField label={field.label} help={field.help} value={(value as LatLng | null) ?? null} onChange={onChange} error={err} />
    case 'image':
      return <ImageField label={field.label} value={String(value ?? '')} onChange={onChange} folder={folder} help={field.help} error={err} />
    case 'lines':
      return (
        <div className="grid gap-2">
          <Label htmlFor={id} help={field.help}>{field.label}</Label>
          <textarea
            id={id}
            rows={Math.max(3, (value as string[] | undefined)?.length ?? 3)}
            value={((value as string[] | undefined) ?? []).join('\n')}
            onChange={(e) => onChange(e.target.value.split('\n'))}
            onBlur={(e) => onChange(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean))}
            className={cn(adminInput, 'h-auto py-2.5 leading-relaxed')}
          />
          {Object.entries(errors).find(([k]) => k.startsWith(`${path}.`))?.[1] && <p className="text-sm text-danger">Each line must be under 500 characters.</p>}
        </div>
      )
    case 'repeater': {
      const items = (value as Values[] | undefined) ?? []
      const set = (next: Values[]) => onChange(next)
      return (
        <fieldset className="grid gap-3">
          <legend className="mb-1 text-sm font-medium text-forest-900">{field.label}</legend>
          {items.map((item, i) => (
            <div key={i} className="rounded-sm border border-forest-900/10 bg-paper/60 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-pebble">{field.itemLabel} {i + 1}</span>
                <div className="flex gap-1">
                  <IconBtn label="Move up" disabled={i === 0} onClick={() => set(items.map((x, j) => (j === i - 1 ? items[i] : j === i ? items[i - 1] : x)))}><ArrowUp className="size-4" /></IconBtn>
                  <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => set(items.map((x, j) => (j === i + 1 ? items[i] : j === i ? items[i + 1] : x)))}><ArrowDown className="size-4" /></IconBtn>
                  <IconBtn label={`Remove ${field.itemLabel.toLowerCase()}`} onClick={() => set(items.filter((_, j) => j !== i))} danger><Trash2 className="size-4" /></IconBtn>
                </div>
              </div>
              <div className="grid gap-4">
                {field.fields.map((sub) => (
                  <FieldInput
                    key={sub.name}
                    field={sub}
                    value={item[sub.name]}
                    path={`${path}.${i}.${sub.name}`}
                    errors={errors}
                    folder={folder}
                    onChange={(v) => set(items.map((x, j) => (j === i ? { ...x, [sub.name]: v } : x)))}
                  />
                ))}
              </div>
            </div>
          ))}
          <div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => set([...items, Object.fromEntries(field.fields.map((f) => [f.name, emptyValueFor(f)]))])}
            >
              <span className="inline-flex items-center gap-1.5"><Plus className="size-4" /> Add {field.itemLabel.toLowerCase()}</span>
            </Button>
          </div>
        </fieldset>
      )
    }
  }
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn('grid size-8 place-items-center rounded-sm text-slate transition-colors hover:bg-forest-900/5 disabled:opacity-30', danger && 'hover:text-danger')}
    >
      {children}
    </button>
  )
}

/** Fields whose type benefits from full width in the two-column layout. */
const WIDE = new Set(['textarea', 'lines', 'repeater', 'image', 'location'])

export function ContentForm({
  fields,
  initial,
  action,
  folder = 'pages',
  submitLabel = 'Save changes',
  redirectTo,
  previewHref,
}: {
  fields: FieldSpec[]
  initial: Values
  action: (data: Values) => Promise<Result>
  folder?: UploadFolder
  submitLabel?: string
  /** After a create, navigate here (`{id}` is replaced with the new id). */
  redirectTo?: string
  previewHref?: string
}) {
  const router = useRouter()
  const [values, setValues] = useState<Values>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)
  const [pending, start] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      const res = await action(values)
      setErrors(res.errors ?? {})
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      toast.success(res.message)
      setDirty(false)
      if (redirectTo && res.id) router.push(redirectTo.replace('{id}', res.id))
      else router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={cn(WIDE.has(f.type) || f.name.startsWith('seo') ? 'md:col-span-2' : '')}>
            <FieldInput
              field={f}
              value={values[f.name]}
              path={f.name}
              errors={errors}
              folder={folder}
              onChange={(v) => {
                setValues((prev) => ({ ...prev, [f.name]: v }))
                setDirty(true)
              }}
            />
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center justify-between gap-3 border-t border-forest-900/10 bg-white/95 px-5 py-4 backdrop-blur md:-mx-8 md:px-8">
        <p className="text-sm text-pebble" aria-live="polite">{pending ? 'Saving…' : dirty ? 'You have unsaved changes' : 'All changes saved'}</p>
        <div className="flex gap-2">
          {previewHref && (
            <a href={previewHref} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-sm px-4 text-sm text-slate hover:text-forest-900">
              View on site ↗
            </a>
          )}
          <Button type="submit" variant="dark" disabled={pending}>{pending ? 'Saving…' : submitLabel}</Button>
        </div>
      </div>
    </form>
  )
}
