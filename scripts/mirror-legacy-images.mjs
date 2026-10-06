// One-time copy of the old fleeket.com images into public/images/legacy, so the site no longer depends on the old
// (slow, soon retired) servers. Collects every api./www.fleeket.com image URL from the code and the database.
// Usage: npm run mirror:images     (re-run after adding categories that still point at the old site)
import nextEnv from '@next/env'
import mongoose from 'mongoose'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

nextEnv.loadEnvConfig(process.cwd())
const OLD = /https:\/\/(?:api|www)\.fleeket\.com\/[^"'`\\\s)]+/g
const OUT = 'public/images/legacy'
const MANIFEST = 'lib/legacy-images.json'
export const localName = (url) => url.replace(/^https:\/\/(api|www)\.fleeket\.com\//, '').replace(/[^A-Za-z0-9._-]+/g, '_')

const urls = new Set()
for (const dir of ['lib', 'app', 'components']) {
  for (const f of await readdir(dir, { recursive: true })) {
    if (/\.(ts|tsx)$/.test(f)) for (const m of (await readFile(join(dir, f), 'utf8')).matchAll(OLD)) urls.add(m[0])
  }
}
if (process.env.MONGODB_URI) {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined, serverSelectionTimeoutMS: 15000 })
  for (const { name } of await mongoose.connection.db.listCollections().toArray()) {
    if (['storeduploads', 'leads', 'users'].includes(name)) continue
    for (const d of await mongoose.connection.db.collection(name).find().toArray()) for (const m of JSON.stringify(d).matchAll(OLD)) urls.add(m[0])
  }
  await mongoose.disconnect()
}

await mkdir(OUT, { recursive: true })
const have = new Set(await readdir(OUT))
const manifest = {}
const failed = []
const queue = [...urls].filter((u) => !u.includes('${') && (/\.(jpe?g|png|webp|gif|avif)$/i.test(u) || !/\.[a-z]{2,4}$/i.test(u)))
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let url; (url = queue.shift()); ) {
      const name = localName(url)
      if (have.has(name)) { manifest[url] = `/images/legacy/${name}`; continue }
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(120_000) })
        const type = res.headers.get('content-type') ?? ''
        if (!res.ok || !type.startsWith('image/')) throw new Error(`${res.status} ${type}`)
        await writeFile(join(OUT, name), Buffer.from(await res.arrayBuffer()))
        manifest[url] = `/images/legacy/${name}`
        console.log(`✓ ${url}`)
      } catch (err) {
        failed.push(`${url} (${err.message})`)
      }
    }
  }),
)
await writeFile(MANIFEST, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + '\n')
console.log(`\n${Object.keys(manifest).length} images mirrored → ${OUT}, map in ${MANIFEST}`)
if (failed.length) console.log(`${failed.length} could not be copied (they will show the placeholder):\n  ${failed.join('\n  ')}`)
