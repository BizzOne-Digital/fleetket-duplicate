import { ImageResponse } from 'next/og'

export const alt = 'Fleeket — Connecting needs with expert deeds'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Default social card in the fleeket.com red. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#ec1c24', padding: 80, color: '#ffffff', fontFamily: 'sans-serif' }}>
        <span style={{ fontSize: 120, fontWeight: 700, letterSpacing: -4 }}>Fleeket</span>
        <span style={{ marginTop: 16, fontSize: 56, fontWeight: 700 }}>Connecting needs with expert deeds</span>
        <span style={{ marginTop: 40, fontSize: 30, color: '#fcc6c8' }}>Find trusted taskers in Canada · fleeket.com</span>
      </div>
    ),
    size,
  )
}
