'use client'

import { useEffect } from 'react'
import { Button, ButtonLink } from '@/components/ui/button'

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-[100svh] items-center bg-forest-900">
      <div className="container-x py-24">
        <p className="t-eyebrow text-lime">Something went wrong</p>
        <h1 className="t-h1 mt-6 max-w-[16ch] text-cream">We hit an unexpected problem.</h1>
        <p className="t-lead mt-6 max-w-lg text-fog">
          Please try again. If it keeps happening, email fleeket@outlook.com{error.digest ? ` and mention reference ${error.digest}` : ''}.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" variant="light" onClick={reset} arrow>Try again</Button>
          <ButtonLink href="/" size="lg" variant="outline" className="text-cream">Back to home</ButtonLink>
        </div>
      </div>
    </main>
  )
}
