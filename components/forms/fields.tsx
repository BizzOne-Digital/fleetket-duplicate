'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Bootstrap-style floating-label controls, matching the forms on fleeket.com.
 * The <label> is a real label (screen readers announce it); it just sits inside the box.
 */
type Base = { label: string; name: string; error?: string; hint?: string; className?: string; required?: boolean }

const box = 'peer w-full rounded border border-[#dee2e6] bg-white px-3 pb-2 pt-[1.35rem] text-[0.8125rem] text-body transition-[border-color,box-shadow] placeholder:text-transparent focus:border-[#f5a3a6] focus:shadow-[0_0_0_0.2rem_rgb(236_28_36/0.18)] focus:outline-none aria-[invalid=true]:border-brand'
const floating =
  'pointer-events-none absolute left-3 top-1 text-[0.6875rem] text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-[0.8125rem] peer-placeholder-shown:text-body peer-focus:top-1 peer-focus:text-[0.6875rem] peer-focus:text-muted'

function Message({ name, error, hint }: { name: string; error?: string; hint?: string }) {
  if (error) return <p id={`${name}-error`} role="alert" className="mt-1 text-xs text-brand">{error}</p>
  if (hint) return <p id={`${name}-hint`} className="mt-1 text-xs text-muted">{hint}</p>
  return null
}

const describedBy = (name: string, error?: string, hint?: string) => (error ? `${name}-error` : hint ? `${name}-hint` : undefined)

export function TextField({ label, name, error, hint, className, required, type = 'text', ...props }: Base & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className={className}>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && show ? 'text' : type}
          placeholder=" "
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(name, error, hint)}
          className={cn(box, 'h-[3.25rem]', isPassword && 'pr-11')}
          {...props}
        />
        <label htmlFor={name} className={floating}>
          {label}
          {required && <span aria-hidden className="text-brand"> *</span>}
        </label>
        {isPassword && (
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark">
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
      <Message name={name} error={error} hint={hint} />
    </div>
  )
}

export function TextAreaField({ label, name, error, hint, className, required, ...props }: Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <div className="relative">
        <textarea
          id={name}
          name={name}
          placeholder=" "
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(name, error, hint)}
          className={cn(box, 'min-h-28 resize-y')}
          {...props}
        />
        <label htmlFor={name} className={floating}>
          {label}
          {required && <span aria-hidden className="text-brand"> *</span>}
        </label>
      </div>
      <Message name={name} error={error} hint={hint} />
    </div>
  )
}

export function SelectField({
  label,
  name,
  error,
  hint,
  className,
  required,
  options,
  placeholder = 'Select',
  ...props
}: Base & { options: readonly (string | { value: string; label: string })[]; placeholder?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      <div className="relative">
        <select
          id={name}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(name, error, hint)}
          className={cn(box, 'h-[3.25rem] cursor-pointer appearance-none pr-8 font-semibold')}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o
            return <option key={opt.value} value={opt.value}>{opt.label}</option>
          })}
        </select>
        <label htmlFor={name} className="pointer-events-none absolute left-3 top-1 text-[0.6875rem] text-muted">
          {label}
          {required && <span aria-hidden className="text-brand"> *</span>}
        </label>
        <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2"><path d="m2 5 6 6 6-6" /></svg>
      </div>
      <Message name={name} error={error} hint={hint} />
    </div>
  )
}

export function CheckboxField({ name, children, error, required, className }: { name: string; children: React.ReactNode; error?: string; required?: boolean; className?: string }) {
  return (
    <div className={className}>
      <label className="flex cursor-pointer items-center gap-3 rounded-sm border border-[#c9ccd1] bg-[#e2e3e5] px-3 py-5 text-[0.8125rem]">
        <input type="checkbox" name={name} required={required} aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-error` : undefined} className="size-4 shrink-0 cursor-pointer accent-[var(--color-brand)]" />
        <span>{children}</span>
      </label>
      {error && <p id={`${name}-error`} role="alert" className="mt-1 text-xs text-brand">{error}</p>}
    </div>
  )
}

/** Visually hidden field bots fill in; real people never see it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute left-[-10000px] top-auto size-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  )
}

export function FormStatus({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state) return null
  return (
    <div role={state.ok ? 'status' : 'alert'} className={cn('rounded border px-4 py-3 text-[0.8125rem]', state.ok ? 'border-[#a3cfbb] bg-[#d1e7dd] text-[#0a3622]' : 'border-[#f1aeb5] bg-[#f8d7da] text-[#58151c]')}>
      {state.message}
    </div>
  )
}

/** The live site's red primary button. */
export function SubmitButton({ pending, children, pendingLabel, className }: { pending: boolean; children: React.ReactNode; pendingLabel: string; className?: string }) {
  return (
    <button type="submit" disabled={pending} className={cn('rounded bg-brand-light px-6 py-2.5 text-[0.9375rem] text-white transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:bg-blush', className)}>
      {pending ? pendingLabel : children}
    </button>
  )
}
