import { cn } from '@/lib/utils'

type Tone = 'light' | 'dark'

const control = (tone: Tone, invalid?: boolean) =>
  cn(
    'w-full rounded-sm border bg-transparent px-4 text-[0.9375rem] transition-[border-color,box-shadow,background-color] duration-300 focus:outline-none',
    tone === 'dark'
      ? 'border-white/12 text-cream placeholder:text-haze hover:border-white/25 focus:border-lime/60 focus:bg-white/[0.03] focus:shadow-[0_0_0_4px_rgb(217_242_90/0.10)]'
      : 'border-forest-900/15 bg-white text-forest-900 placeholder:text-pebble hover:border-forest-900/30 focus:border-moss focus:shadow-[0_0_0_4px_rgb(86_102_28/0.16)]',
    invalid && (tone === 'dark' ? 'border-danger/70' : 'border-danger'),
  )

type BaseProps = { label: string; name: string; error?: string; hint?: string; tone?: Tone; className?: string; required?: boolean }

function Wrapper({ label, name, error, hint, tone = 'light', className, required, children }: BaseProps & { children: React.ReactNode }) {
  return (
    <div className={cn('grid gap-2', className)}>
      <label htmlFor={name} className={cn('text-sm font-medium', tone === 'dark' ? 'text-mist' : 'text-forest-900')}>
        {label}
        {required ? <span aria-hidden className="text-moss"> *</span> : <span className={cn('ml-1.5 font-normal', tone === 'dark' ? 'text-haze' : 'text-pebble')}>(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="text-sm text-danger" role="alert">{error}</p>
      ) : hint ? (
        <p id={`${name}-hint`} className={cn('text-sm', tone === 'dark' ? 'text-haze' : 'text-pebble')}>{hint}</p>
      ) : null}
    </div>
  )
}

const describedBy = (name: string, error?: string, hint?: string) => (error ? `${name}-error` : hint ? `${name}-hint` : undefined)

export function TextField({ label, name, error, hint, tone = 'light', className, required, ...props }: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper {...{ label, name, error, hint, tone, className, required }}>
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={cn(control(tone, !!error), 'h-12')}
        {...props}
      />
    </Wrapper>
  )
}

export function TextAreaField({ label, name, error, hint, tone = 'light', className, required, ...props }: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrapper {...{ label, name, error, hint, tone, className, required }}>
      <textarea
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={cn(control(tone, !!error), 'min-h-36 resize-y py-3 leading-relaxed')}
        {...props}
      />
    </Wrapper>
  )
}

export function SelectField({
  label,
  name,
  error,
  hint,
  tone = 'light',
  className,
  required,
  options,
  placeholder,
  ...props
}: BaseProps & { options: readonly (string | { value: string; label: string })[]; placeholder?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrapper {...{ label, name, error, hint, tone, className, required }}>
      <div className="relative">
        <select
          id={name}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(name, error, hint)}
          className={cn(control(tone, !!error), 'h-12 cursor-pointer appearance-none pr-10')}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o
            return <option key={opt.value} value={opt.value} className={tone === 'dark' ? 'bg-forest-850' : ''}>{opt.label}</option>
          })}
        </select>
        <svg aria-hidden viewBox="0 0 16 16" className={cn('pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2', tone === 'dark' ? 'text-fog' : 'text-slate')} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6l4 4 4-4" /></svg>
      </div>
    </Wrapper>
  )
}

export function CheckboxField({ name, children, error, tone = 'light', required }: { name: string; children: React.ReactNode; error?: string; tone?: Tone; required?: boolean }) {
  return (
    <div className="grid gap-2">
      <label className={cn('flex cursor-pointer items-start gap-3 text-sm leading-relaxed', tone === 'dark' ? 'text-fog' : 'text-slate')}>
        <input
          type="checkbox"
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className="mt-0.5 size-[1.125rem] shrink-0 cursor-pointer accent-[var(--color-moss)]"
        />
        <span>{children}</span>
      </label>
      {error && <p id={`${name}-error`} className="text-sm text-danger" role="alert">{error}</p>}
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

export function FormStatus({ state, tone = 'light' }: { state: { ok: boolean; message: string } | null; tone?: Tone }) {
  if (!state) return null
  return (
    <div
      role={state.ok ? 'status' : 'alert'}
      className={cn(
        'flex gap-3 rounded-sm border px-4 py-3.5 text-sm leading-relaxed',
        state.ok
          ? tone === 'dark' ? 'border-success/40 bg-success/10 text-mist' : 'border-success/40 bg-success/10 text-forest-900'
          : tone === 'dark' ? 'border-danger/40 bg-danger/10 text-mist' : 'border-danger/40 bg-danger/[0.07] text-forest-900',
      )}
    >
      <span aria-hidden className={cn('mt-1.5 size-2 shrink-0 rounded-full', state.ok ? 'bg-success' : 'bg-danger')} />
      {state.message}
    </div>
  )
}
