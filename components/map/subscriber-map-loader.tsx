'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { SubscriberMap } from '@/components/map/subscriber-map'

// Leaflet is browser-only and ~40 KB — load it on demand, with a sized placeholder so nothing shifts.
const Map = dynamic(() => import('@/components/map/subscriber-map').then((m) => m.SubscriberMap), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-md border border-line bg-panel" />,
})

export function SubscriberMapLoader({ className, ...props }: ComponentProps<typeof SubscriberMap>) {
  return (
    <div className={className}>
      <Map {...props} className="size-full" />
    </div>
  )
}
