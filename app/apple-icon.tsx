import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#26352e' }}>
        <svg width="120" height="84" viewBox="0 0 40 28" fill="none">
          <path d="M9 1.5h22l7.5 12.5L31 26.5H9L1.5 14 9 1.5Z" stroke="#f7f6ec" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12.5 14h15" stroke="#d9f25a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12.5" cy="14" r="3" fill="#f7f6ec" />
          <circle cx="27.5" cy="14" r="3" fill="#d9f25a" />
        </svg>
      </div>
    ),
    size,
  )
}
