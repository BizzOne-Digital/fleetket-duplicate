import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fleeket',
    short_name: 'Fleeket',
    description: 'Connecting needs with expert deeds.',
    start_url: '/',
    display: 'standalone',
    background_color: '#26352e',
    theme_color: '#26352e',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  }
}
