'use client'

import { MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0b1728',
            color: '#e8ecf2',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
    </MotionConfig>
  )
}
