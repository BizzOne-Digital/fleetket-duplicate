import { ImageResponse } from 'next/og'

export const alt = 'Fleeket — Connecting needs with expert deeds'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Default social card, generated at build time so it always matches the brand. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#26352e', padding: 80, color: '#f7f6ec', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="80" height="56" viewBox="0 0 40 28" fill="none">
            <path d="M9 1.5h22l7.5 12.5L31 26.5H9L1.5 14 9 1.5Z" stroke="#f7f6ec" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M12.5 14h15" stroke="#d9f25a" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12.5" cy="14" r="2.6" fill="#f7f6ec" />
            <circle cx="27.5" cy="14" r="2.6" fill="#d9f25a" />
          </svg>
          <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: -2 }}>Fleeket</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 88, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Connecting needs</span>
          <span style={{ fontSize: 88, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05, color: '#d9f25a' }}>with expert deeds.</span>
          <span style={{ marginTop: 36, fontSize: 28, color: '#b9c2af' }}>Service discovery for Canada &amp; the United States · fleeket.com</span>
        </div>
      </div>
    ),
    size,
  )
}
