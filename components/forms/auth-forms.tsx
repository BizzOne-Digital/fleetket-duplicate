'use client'

import Link from 'next/link'
import { useState } from 'react'
import { login, register } from '@/app/actions/public'
import { Button } from '@/components/ui/button'
import { CheckboxField, FormStatus, TextField } from '@/components/forms/fields'
import { useFormAction } from '@/components/forms/use-form-action'
import { cn } from '@/lib/utils'

export function LoginForm({ next }: { next?: string }) {
  const { state, pending, onSubmit, formRef, errors } = useFormAction(login)
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5" aria-busy={pending}>
      {next && <input type="hidden" name="next" value={next} />}
      <TextField tone="dark" label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      <TextField tone="dark" label="Password" name="password" type="password" autoComplete="current-password" required error={errors.password} />
      <FormStatus state={state && !state.ok ? state : null} tone="dark" />
      <Button type="submit" size="lg" variant="light" disabled={pending} arrow={!pending} className="w-full">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-fog">
        New to Fleeket? <Link href="/register" className="text-cream underline underline-offset-4">Create an account</Link>
      </p>
    </form>
  )
}

export function RegisterForm() {
  const { state, pending, onSubmit, formRef, errors } = useFormAction(register)
  const [type, setType] = useState<'customer' | 'provider'>('customer')
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5" aria-busy={pending}>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-mist">I’m here to…</legend>
        <div className="grid grid-cols-2 gap-2">
          {([
            ['customer', 'Find a service'],
            ['provider', 'Offer a service'],
          ] as const).map(([value, label]) => (
            <label
              key={value}
              className={cn(
                'flex h-12 cursor-pointer items-center justify-center rounded-sm border text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lime',
                type === value ? 'border-lime/60 bg-lime/10 text-cream' : 'border-white/12 text-fog hover:border-white/25',
              )}
            >
              <input type="radio" name="accountType" value={value} checked={type === value} onChange={() => setType(value)} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <TextField tone="dark" label="Full name" name="name" autoComplete="name" required error={errors.name} />
      <TextField tone="dark" label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      <TextField tone="dark" label="Password" name="password" type="password" autoComplete="new-password" required hint="At least 10 characters, with a letter and a number." error={errors.password} />
      <CheckboxField name="terms" tone="dark" required error={errors.terms}>
        I agree to the <Link href="/terms" className="underline underline-offset-2">Terms &amp; Conditions</Link> and <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
      </CheckboxField>
      <FormStatus state={state && !state.ok ? state : null} tone="dark" />
      <Button type="submit" size="lg" variant="light" disabled={pending} arrow={!pending} className="w-full">
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
      <p className="text-center text-sm text-fog">
        Already have an account? <Link href="/login" className="text-cream underline underline-offset-4">Sign in</Link>
      </p>
    </form>
  )
}
