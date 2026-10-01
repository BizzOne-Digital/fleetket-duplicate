export const PLACEHOLDER_IMAGE = '/placeholder.jpg'

/** Legacy disk uploads (/uploads/…) don't survive serverless deploys — show the placeholder instead. */
export function resolveImageSrc(src: string | null | undefined) {
  if (!src || src.startsWith('/uploads/')) return PLACEHOLDER_IMAGE
  return src
}
