import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'Fleeket — Connecting needs with expert deeds'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Default social card: the Fleeket badge on white. */
export default async function OpengraphImage() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), 'public/fleeket-logo.png'))).toString('base64')}`
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', fontFamily: 'sans-serif' }}>
        <img src={logo} width={830} height={200} alt="" />
        <span style={{ marginTop: 48, fontSize: 48, fontWeight: 700, color: '#333333' }}>Connecting needs with expert deeds</span>
      </div>
    ),
    size,
  )
}
