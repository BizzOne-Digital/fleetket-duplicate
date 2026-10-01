'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="grid min-h-[60svh] place-items-center px-4 py-16 text-center">
      <div>
        <h1 className="text-[1.75rem] font-bold text-ink">Something went wrong</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Please try again. If it keeps happening, email fleeket@outlook.com{error.digest ? ` and mention reference ${error.digest}` : ''}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="rounded bg-brand-light px-6 py-2.5 text-white hover:bg-brand">Try again</button>
          <Link href="/" className="rounded border border-brand px-6 py-2.5 text-brand hover:bg-brand hover:text-white">Back to home</Link>
        </div>
      </div>
    </main>
  )
}
