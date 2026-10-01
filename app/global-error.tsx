'use client'

// Last-resort boundary: replaces the root layout, so it carries its own <html> and inline styles.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#26352e', color: '#e8ecf2', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 520, padding: 24 }}>
          <p style={{ color: '#d9f25a', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>Fleeket</p>
          <h1 style={{ fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '16px 0' }}>We’re having trouble loading the site.</h1>
          <p style={{ color: '#b9c2af', lineHeight: 1.6 }}>Please try again in a moment. If the problem continues, email fleeket@outlook.com.</p>
          <button onClick={reset} style={{ marginTop: 24, height: 48, padding: '0 24px', background: '#f7f6ec', color: '#26352e', border: 0, borderRadius: 4, fontSize: 15, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
