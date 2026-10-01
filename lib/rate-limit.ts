import 'server-only'
import { headers } from 'next/headers'

// ponytail: in-memory fixed window per server instance. On multi-instance serverless this is best-effort;
// move to Upstash/Redis if abuse appears.
const hits = new Map<string, { count: number; reset: number }>()

export async function clientIp() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

/** Returns true when the caller is over the limit. */
export async function rateLimited(bucket: string, limit: number, windowMs: number) {
  const key = `${bucket}:${await clientIp()}`
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs })
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
    return false
  }
  entry.count++
  return entry.count > limit
}
