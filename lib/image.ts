import LEGACY from './legacy-images.json'

export const PLACEHOLDER_IMAGE = '/placeholder.jpg'

/** Legacy disk uploads (/uploads/…) don't survive serverless deploys — show the placeholder instead. */
export function resolveImageSrc(src: string | null | undefined) {
  if (!src || src.startsWith('/uploads/')) return PLACEHOLDER_IMAGE
  // Images from the old fleeket.com are served from our own copy (npm run mirror:images) — the old servers are too
  // slow for the image optimizer (it gives up after 7s) and go away when the domain moves to this site.
  return (LEGACY as Record<string, string>)[src] ?? src
}
