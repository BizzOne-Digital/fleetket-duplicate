'use client'

// Last-resort boundary: replaces the root layout, so it carries its own <html> and inline styles.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#ffffff', color: '#212529', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 520, padding: 24 }}>
          <p style={{ color: '#ec1c24', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>Fleeket</p>
          <h1 style={{ fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '16px 0' }}>We’re having trouble loading the site.</h1>
          <p style={{ color: '#6c757d', lineHeight: 1.6 }}>Please try again in a moment. If the problem continues, email fleeket@outlook.com.</p>
          <button onClick={reset} style={{ marginTop: 24, height: 48, padding: '0 24px', background: '#ec1c24', color: '#ffffff', border: 0, borderRadius: 4, fontSize: 15, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
