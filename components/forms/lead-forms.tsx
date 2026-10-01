'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { submitContact, submitProviderListing, submitServiceRequest } from '@/app/actions/public'
import { Button } from '@/components/ui/button'
import { CheckboxField, FormStatus, Honeypot, SelectField, TextAreaField, TextField } from '@/components/forms/fields'
import { useFormAction } from '@/components/forms/use-form-action'
import { CONTACT_REASONS } from '@/lib/constants'

type Tone = 'light' | 'dark'

function Consent({ error, tone }: { error?: string; tone: Tone }) {
  return (
    <CheckboxField name="consent" required error={error} tone={tone}>
      I agree that Fleeket may store these details and contact me about this request, as described in the{' '}
      <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
    </CheckboxField>
  )
}

export function ContactForm({ categories, tone = 'light' }: { categories: string[]; tone?: Tone }) {
  const pathname = usePathname()
  const { state, pending, onSubmit, formRef, errors } = useFormAction(submitContact)
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative grid gap-6" aria-busy={pending}>
      <Honeypot />
      <input type="hidden" name="sourcePage" value={pathname} />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField tone={tone} label="Full name" name="name" required autoComplete="name" error={errors.name} />
        <TextField tone={tone} label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <TextField tone={tone} label="Phone" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
        <TextField tone={tone} label="Company or business" name="business" autoComplete="organization" error={errors.business} />
        <SelectField tone={tone} label="Reason for contacting us" name="reason" required options={CONTACT_REASONS} placeholder="Choose one" error={errors.reason} />
        <SelectField tone={tone} label="Service category" name="category" options={categories} placeholder="Not specific" error={errors.category} />
      </div>
      <TextField tone={tone} label="Subject" name="subject" required error={errors.subject} />
      <TextAreaField tone={tone} label="Message" name="message" required rows={6} error={errors.message} />
      <Consent tone={tone} error={errors.consent} />
      <FormStatus state={state} tone={tone} />
      <div>
        <Button type="submit" size="lg" variant={tone === 'dark' ? 'light' : 'dark'} disabled={pending} arrow={!pending}>
          {pending ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </form>
  )
}

export function ProviderListingForm({ categories, tone = 'dark' }: { categories: { name: string; slug: string }[]; tone?: Tone }) {
  const pathname = usePathname()
  const { state, pending, onSubmit, formRef, errors } = useFormAction(submitProviderListing)

  // Preselect the category when arriving from a category page (?category=slug).
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('category')
    const match = categories.find((c) => c.slug === slug)
    const select = formRef.current?.elements.namedItem('category')
    if (match && select instanceof HTMLSelectElement) select.value = match.name
  }, [categories, formRef])
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative grid gap-6" aria-busy={pending}>
      <Honeypot />
      <input type="hidden" name="sourcePage" value={pathname} />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField tone={tone} label="Your name" name="name" required autoComplete="name" error={errors.name} />
        <TextField tone={tone} label="Business or trade name" name="business" required autoComplete="organization" error={errors.business} />
        <TextField tone={tone} label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <TextField tone={tone} label="Phone" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
        <SelectField tone={tone} label="Service category" name="category" required options={categories.map((c) => c.name)} placeholder="Choose a category" error={errors.category} />
        <TextField tone={tone} label="Where do you work?" name="area" required placeholder="e.g. Greater Toronto Area, ON" error={errors.area} />
      </div>
      <TextAreaField tone={tone} label="Tell us about your service" name="message" rows={5} error={errors.message} />
      <Consent tone={tone} error={errors.consent} />
      <FormStatus state={state} tone={tone} />
      <div>
        <Button type="submit" size="lg" variant={tone === 'dark' ? 'primary' : 'dark'} disabled={pending} arrow={!pending}>
          {pending ? 'Submitting…' : 'Submit listing request'}
        </Button>
      </div>
    </form>
  )
}

export function ServiceRequestForm({ categories, defaultCategory = '', defaultArea = '', tone = 'light' }: { categories: string[]; defaultCategory?: string; defaultArea?: string; tone?: Tone }) {
  const pathname = usePathname()
  const { state, pending, onSubmit, formRef, errors } = useFormAction(submitServiceRequest)
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative grid gap-5" aria-busy={pending}>
      <Honeypot />
      <input type="hidden" name="sourcePage" value={pathname} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField tone={tone} label="Full name" name="name" required autoComplete="name" error={errors.name} />
        <TextField tone={tone} label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <SelectField tone={tone} label="Service" name="category" required options={categories} placeholder="Choose a service" defaultValue={defaultCategory} error={errors.category} />
        <TextField tone={tone} label="Location" name="area" required placeholder="City, province or state" defaultValue={defaultArea} error={errors.area} />
      </div>
      <TextField tone={tone} label="Phone" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
      <TextAreaField tone={tone} label="What do you need?" name="message" required rows={4} placeholder="A few details about the job, timing and anything a provider should know." error={errors.message} />
      <Consent tone={tone} error={errors.consent} />
      <FormStatus state={state} tone={tone} />
      <div>
        <Button type="submit" size="lg" variant={tone === 'dark' ? 'primary' : 'dark'} disabled={pending} arrow={!pending}>
          {pending ? 'Sending…' : 'Request a provider'}
        </Button>
      </div>
    </form>
  )
}
