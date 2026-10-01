'use client'

import { startTransition, useActionState, useEffect, useRef } from 'react'
import type { FormState } from '@/lib/schemas'

/**
 * Submits through a server action without React's automatic form reset, so a validation
 * error never wipes what the visitor typed. Resets only after a successful submission.
 */
export function useFormAction(action: (prev: FormState, form: FormData) => Promise<FormState>) {
  const [state, formAction, pending] = useActionState(action, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
    if (state && !state.ok && state.errors) {
      const first = Object.keys(state.errors)[0]
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
    }
  }, [state])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(() => formAction(data))
  }

  return { state, pending, onSubmit, formRef, errors: state?.errors ?? {} }
}
