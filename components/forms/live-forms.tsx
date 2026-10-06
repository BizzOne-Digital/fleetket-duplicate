'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { login, registerTasker, submitContact, submitListing, submitServiceRequest } from '@/app/actions/public'
import { CheckboxField, FormStatus, Honeypot, SelectField, SubmitButton, TextAreaField, TextField } from '@/components/forms/fields'
import { useFormAction } from '@/components/forms/use-form-action'
import { COUNTRIES, WEEKDAYS } from '@/lib/constants'
import { formatMoney, maxListingDays, quoteListing, todayISO, type ListingDuration } from '@/lib/listings'
import { cn } from '@/lib/utils'

export function ContactForm() {
  const pathname = usePathname()
  const { state, pending, onSubmit, formRef, errors } = useFormAction(submitContact)
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative grid gap-3" aria-busy={pending}>
      <Honeypot />
      <input type="hidden" name="sourcePage" value={pathname} />
      <TextField label="Full Name" name="name" required autoComplete="name" error={errors.name} />
      <TextField label="Email Address" name="email" type="email" required autoComplete="email" error={errors.email} />
      <TextField label="Mobile Number" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
      <TextField label="Subject" name="subject" required error={errors.subject} />
      <TextAreaField label="Your Message" name="message" required rows={5} error={errors.message} />
      <FormStatus state={state} />
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingLabel="Sending…">Get In Touch</SubmitButton>
      </div>
    </form>
  )
}

/** “Ready to make your choice?” — the request box on a sub-service page. */
export function ServiceRequestForm({ category, subService, providers }: { category: string; subService: string; providers: { id: string; name: string; city: string; region: string }[] }) {
  const pathname = usePathname()
  const { state, pending, onSubmit, formRef, errors } = useFormAction(submitServiceRequest)
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative grid gap-3" aria-busy={pending}>
      <Honeypot />
      <input type="hidden" name="sourcePage" value={pathname} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="subService" value={subService} />
      {providers.length > 0 && (
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-[0.8125rem] font-semibold text-ink">Choose the taskers you’d like to hear from</legend>
          {providers.map((p) => (
            <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded border border-[#dee2e6] bg-white px-3 py-2.5 text-[0.8125rem] has-[:checked]:border-brand has-[:checked]:bg-brand/5">
              <input type="checkbox" name="providers" value={p.id} defaultChecked className="size-4 accent-[var(--color-brand)]" />
              <span className="flex-1 font-semibold">{p.name}</span>
              <span className="text-muted">{[p.city, p.region].filter(Boolean).join(', ')}</span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Full Name" name="name" required autoComplete="name" error={errors.name} />
        <TextField label="Email Address" name="email" type="email" required autoComplete="email" error={errors.email} />
      </div>
      <TextField label="Mobile Number" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
      <TextAreaField label="What do you need?" name="message" required rows={4} error={errors.message} />
      <FormStatus state={state} />
      <div className="flex items-center gap-6">
        <SubmitButton pending={pending} pendingLabel="Sending…">Confirm &amp; Send</SubmitButton>
        <button type="reset" className="text-[0.9375rem] text-brand-dark hover:underline">Cancel</button>
      </div>
    </form>
  )
}

function TermsBox({ error }: { error?: string }) {
  return (
    <CheckboxField name="terms" required error={error}>
      Please, read and check our{' '}
      <Link href="/terms" target="_blank" className="text-[0.9375rem] font-bold text-ink underline underline-offset-2">Terms &amp; Conditions</Link>
    </CheckboxField>
  )
}

/** Name → postal code: the fields shared by both sign-up forms. */
function ProfileFields({ errors }: { errors: Record<string, string> }) {
  return (
    <div className="grid gap-3">
      <TextField label="Full Name" name="name" required autoComplete="name" error={errors.name} />
      <TextField label="Email address" name="email" type="email" required autoComplete="email" error={errors.email} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Password" name="password" type="password" required autoComplete="new-password" hint="10+ characters, with a letter and a number" error={errors.password} />
        <TextField label="Confirm Password" name="confirmPassword" type="password" required autoComplete="new-password" error={errors.confirmPassword} />
      </div>
      <TextField label="Mobile Number" name="phone" type="tel" autoComplete="tel" className="sm:max-w-[calc(50%-0.375rem)]" error={errors.phone} />
      <TextField label="Street address" name="address" autoComplete="street-address" error={errors.address} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SelectField label="Country" name="country" options={COUNTRIES} placeholder="Select country" autoComplete="country-name" error={errors.country} />
        <TextField label="City" name="city" autoComplete="address-level2" error={errors.city} />
        <TextField label="Province / State" name="region" autoComplete="address-level1" error={errors.region} />
        <TextField label="Postal Code" name="postalCode" autoComplete="postal-code" error={errors.postalCode} />
      </div>
    </div>
  )
}

function FormActions({ pending, label }: { pending: boolean; label: string }) {
  return (
    <div className="flex items-center gap-10">
      <SubmitButton pending={pending} pendingLabel="Creating account…" className="px-6 py-2.5">{label}</SubmitButton>
      <Link href="/" className="text-[0.9375rem] text-brand-dark hover:underline">Cancel</Link>
    </div>
  )
}

type SkillGroup = { slug: string; name: string; subServices: { slug: string; name: string }[] }

/** Multi-select of sub-services grouped by category (“Choose skills from”). */
function SkillPicker({ groups, error }: { groups: SkillGroup[]; error?: string }) {
  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const labelOf = useMemo(() => {
    const m = new Map<string, string>()
    groups.forEach((g) => g.subServices.forEach((s) => m.set(`${g.slug}/${s.slug}`, s.name)))
    return m
  }, [groups])
  const toggle = (v: string) => setSelected((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))
  const q = filter.trim().toLowerCase()

  return (
    <div>
      {selected.map((v) => <input key={v} type="hidden" name="skills" value={v} />)}
      <div className={cn('relative rounded border bg-white', error ? 'border-brand' : 'border-[#dee2e6]')}>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="skill-list" className="flex min-h-[3.25rem] w-full items-start justify-between gap-3 px-3 pb-2 pt-1.5 text-left">
          <span className="min-w-0">
            <span className="block text-[0.6875rem] text-muted">Choose skills from</span>
            <span className="mt-1 flex flex-wrap gap-1.5">
              {selected.length === 0 && <span className="text-[0.8125rem] text-muted">Select one or more services you offer</span>}
              {selected.map((v) => (
                <span key={v} className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-xs text-white">
                  {labelOf.get(v)}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${labelOf.get(v)}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(v)
                    }}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle(v))}
                  >
                    <X aria-hidden className="size-3" />
                  </span>
                </span>
              ))}
            </span>
          </span>
          <ChevronDown aria-hidden className={cn('mt-3 size-4 shrink-0 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div id="skill-list" className="border-t border-[#dee2e6]">
            <div className="p-2">
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter skills…" aria-label="Filter skills" className="live-input py-2" />
            </div>
            <div className="max-h-72 overflow-y-auto px-2 pb-2">
              {groups.map((g) => {
                const subs = g.subServices.filter((s) => !q || s.name.toLowerCase().includes(q) || g.name.toLowerCase().includes(q))
                if (!subs.length) return null
                return (
                  <fieldset key={g.slug} className="mb-2">
                    <legend className="px-1 py-1 text-xs font-bold uppercase tracking-wide text-muted">{g.name}</legend>
                    {subs.map((s) => {
                      const v = `${g.slug}/${s.slug}`
                      return (
                        <label key={v} className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-[0.8125rem] hover:bg-panel">
                          <input type="checkbox" checked={selected.includes(v)} onChange={() => toggle(v)} className="size-4 accent-[var(--color-brand)]" />
                          {s.name}
                        </label>
                      )
                    })}
                  </fieldset>
                )
              })}
            </div>
          </div>
        )}
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-brand">{error}</p>}
    </div>
  )
}

function HoursTable() {
  return (
    <div className="grid gap-3">
      {WEEKDAYS.map((day, i) => (
        <div key={day} className="grid grid-cols-[1fr_1fr] items-center gap-3 sm:grid-cols-[8rem_1fr_1fr_auto]">
          <span className="col-span-2 text-[0.8125rem] font-semibold sm:col-span-1">{day}</span>
          <label className="relative">
            <span className="absolute left-3 top-1 text-[0.6875rem] text-muted">Start from</span>
            <input type="time" name={`hours.${i}.start`} defaultValue="10:00" className="live-input pb-1.5 pt-5 font-semibold" />
          </label>
          <label className="relative">
            <span className="absolute left-3 top-1 text-[0.6875rem] text-muted">End</span>
            <input type="time" name={`hours.${i}.end`} defaultValue="18:00" className="live-input pb-1.5 pt-5 font-semibold" />
          </label>
          <label className="col-span-2 flex items-center gap-2 text-[0.8125rem] sm:col-span-1 sm:pl-4">
            <input type="checkbox" name={`hours.${i}.closed`} className="size-4 accent-[var(--color-brand)]" defaultChecked={day === 'Sunday'} /> Closed
          </label>
        </div>
      ))}
    </div>
  )
}

export function TaskerForm({ groups, copy }: { groups: SkillGroup[]; copy: { skillsTitle: string; skillsBody: string; hoursTitle: string; hoursBody: string } }) {
  const { state, pending, onSubmit, formRef, errors } = useFormAction(registerTasker)
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6" aria-busy={pending}>
      <ProfileFields errors={errors} />
      <section className="grid gap-3">
        <h2 className="text-[2rem] font-bold leading-tight text-ink">{copy.skillsTitle}</h2>
        <p>{copy.skillsBody}</p>
        <SkillPicker groups={groups} error={errors.skills} />
      </section>
      <section className="grid gap-3">
        <h2 className="text-[2rem] font-bold leading-tight text-ink">{copy.hoursTitle}</h2>
        <p>{copy.hoursBody}</p>
        <HoursTable />
        {Object.keys(errors).some((k) => k.startsWith('hours')) && <p role="alert" className="text-xs text-brand">Please use valid times (HH:MM) for each open day.</p>}
      </section>
      <TextField label="Promo code (optional)" name="promoCode" autoComplete="off" maxLength={40} hint="Have a code for free months? Enter it here." error={errors.promoCode} />
      <TermsBox error={errors.terms} />
      <FormStatus state={state && !state.ok ? state : null} />
      <FormActions pending={pending} label="Create Account" />
    </form>
  )
}

export function LoginForm({ next }: { next?: string }) {
  const { state, pending, onSubmit, formRef, errors } = useFormAction(login)
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-4" aria-busy={pending}>
      {next && <input type="hidden" name="next" value={next} />}
      <TextField label="Email address" name="email" type="email" autoComplete="email" required error={errors.email} />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required error={errors.password} />
      <div className="flex items-center justify-between gap-4 text-[0.8125rem]">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" name="remember" defaultChecked className="size-4 accent-[var(--color-brand)]" /> Remember Me
        </label>
        <Link href="/contact" className="text-[0.9375rem] text-member underline underline-offset-2">Forgot Password?</Link>
      </div>
      <FormStatus state={state && !state.ok ? state : null} />
      <SubmitButton pending={pending} pendingLabel="Signing in…" className="w-full">Sign In</SubmitButton>
    </form>
  )
}

/** Post an ad in a listing category — shows the price for the chosen dates before paying. */
export function ListingForm({ category, plan }: { category: string; plan: { durations: ListingDuration[]; currency: string; addressRequired: boolean; requiresApproval: boolean } }) {
  const { state, pending, onSubmit, formRef, errors } = useFormAction(submitListing)
  const today = todayISO()
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const quote = quoteListing(plan.durations, start, end)
  const maxDays = maxListingDays(plan.durations)
  const price = quote ? formatMoney(quote.amount, plan.currency || 'CAD') : null
  const paid = Boolean(quote && quote.amount > 0)

  if (state?.ok) return <FormStatus state={state} />

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative grid gap-3" aria-busy={pending}>
      <Honeypot />
      <input type="hidden" name="category" value={category} />
      <TextField label="Ad title" name="title" required maxLength={120} error={errors.title} />
      <TextAreaField label="Description" name="description" required rows={5} maxLength={3000} error={errors.description} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Start date" name="startDate" type="date" required min={today} value={start} onChange={(e) => { setStart(e.target.value); if (e.target.value > end) setEnd(e.target.value) }} error={errors.startDate} />
        <TextField label="End date" name="endDate" type="date" required min={start} value={end} onChange={(e) => setEnd(e.target.value)} hint={`Up to ${maxDays} days`} error={errors.endDate} />
      </div>
      <TextField label="Street address" name="address" required={plan.addressRequired} autoComplete="street-address" error={errors.address} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <TextField label="City" name="city" required autoComplete="address-level2" error={errors.city} />
        <TextField label="Province / State" name="region" autoComplete="address-level1" error={errors.region} />
        <TextField label="Postal Code" name="postalCode" autoComplete="postal-code" className="col-span-2 sm:col-span-1" error={errors.postalCode} />
      </div>
      <div>
        <label htmlFor="photo" className="mb-1 block text-[0.8125rem] font-semibold text-ink">Photo <span className="font-normal text-muted">(optional, JPEG, PNG or WebP up to 5 MB)</span></label>
        <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-invalid={errors.photo ? true : undefined} className="block w-full rounded border border-[#dee2e6] bg-white text-[0.8125rem] file:mr-3 file:border-0 file:bg-panel file:px-4 file:py-2.5 file:text-body" />
        {errors.photo && <p role="alert" className="mt-1 text-xs text-brand">{errors.photo}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Your name" name="contactName" required autoComplete="name" error={errors.contactName} />
        <TextField label="Email address" name="email" type="email" required autoComplete="email" hint="Private — for your receipt and updates" error={errors.email} />
      </div>
      <TextField label="Phone (shown on the ad)" name="phone" type="tel" autoComplete="tel" required error={errors.phone} />
      <TermsBox error={errors.terms} />
      <p aria-live="polite" className="rounded bg-panel px-4 py-3 text-[0.9375rem]">
        {quote ? (
          <>
            {quote.days} day{quote.days === 1 ? '' : 's'} · <strong className="text-brand">{price}</strong>
            {plan.requiresApproval && <span className="text-muted"> · reviewed by our team before it goes live</span>}
          </>
        ) : (
          <span className="text-brand">Choose dates within {maxDays} days.</span>
        )}
      </p>
      <FormStatus state={state} />
      <div className="flex items-center gap-6">
        <SubmitButton pending={pending} pendingLabel={paid ? 'Opening payment…' : 'Sending…'}>{paid ? `Continue to payment — ${price}` : 'Submit ad'}</SubmitButton>
        <Link href={`/services/${category}`} className="text-[0.9375rem] text-brand-dark hover:underline">Cancel</Link>
      </div>
    </form>
  )
}
