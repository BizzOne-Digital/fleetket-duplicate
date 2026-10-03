import 'server-only'
import { randomBytes } from 'node:crypto'
import { connectDb } from './db'
import { StoredUpload } from './models'
import { UPLOAD_FOLDERS, UPLOAD_MAX_BYTES, UPLOAD_MIME_TYPES, type UploadFolder } from './constants'

export const UPLOAD_URL_PREFIX = '/api/uploads/'

export function isSafeFilename(name: string) {
  return /^[\w.-]+$/.test(name) && !name.includes('..')
}

export function parseUploadUrl(url: string | null | undefined): { folder: UploadFolder; filename: string } | null {
  if (!url?.startsWith(UPLOAD_URL_PREFIX)) return null
  const [folder, filename, ...rest] = url.slice(UPLOAD_URL_PREFIX.length).split('?')[0].split('/')
  if (rest.length || !filename || !isSafeFilename(filename)) return null
  if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) return null
  return { folder: folder as UploadFolder, filename }
}

/** Remove the stored binary behind an /api/uploads/… URL. No-op for external or legacy URLs. */
export async function deleteUploadByUrl(url: string | null | undefined) {
  const parsed = parseUploadUrl(url)
  if (!parsed) return false
  await connectDb()
  const res = await StoredUpload.deleteOne(parsed)
  return res.deletedCount > 0
}

/** After an edit, delete uploads that were referenced before but no longer are. */
export async function deleteReplacedUploads(before: unknown, after: unknown) {
  const collect = (v: unknown, out = new Set<string>()): Set<string> => {
    if (typeof v === 'string') {
      if (v.startsWith(UPLOAD_URL_PREFIX)) out.add(v)
    } else if (Array.isArray(v)) v.forEach((x) => collect(x, out))
    else if (v && typeof v === 'object') Object.values(v).forEach((x) => collect(x, out))
    return out
  }
  const still = collect(after)
  await Promise.all([...collect(before)].filter((u) => !still.has(u)).map(deleteUploadByUrl))
}

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

/** Magic-byte check so a renamed file can't pass as an image. */
function sniff(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  if (buf.subarray(0, 4).toString('ascii') === 'GIF8') return 'image/gif'
  return null
}

/**
 * Validates an uploaded image (type, size, real contents) and stores it in MongoDB.
 * Returns its /api/uploads/… URL, or an error message (and HTTP status) to show the uploader.
 */
export async function storeImage(
  file: File,
  folder: UploadFolder,
  { maxBytes = UPLOAD_MAX_BYTES, meta = {} }: { maxBytes?: number; meta?: { width?: number; height?: number; alt?: string; title?: string } } = {},
): Promise<{ url: string; filename: string; size: number } | { error: string; status: number }> {
  if (!(UPLOAD_MIME_TYPES as readonly string[]).includes(file.type)) return { error: 'Only JPEG, PNG, WebP or GIF images are allowed', status: 415 }
  if (file.size > maxBytes) return { error: `Images must be ${Math.round(maxBytes / 1024 / 1024)} MB or smaller`, status: 413 }
  const data = Buffer.from(await file.arrayBuffer())
  const mimeType = sniff(data)
  if (!mimeType || mimeType !== file.type) return { error: 'File contents do not match an allowed image type', status: 415 }

  const filename = `${Date.now()}-${randomBytes(6).toString('hex')}.${EXT[mimeType]}`
  await connectDb()
  await StoredUpload.create({ folder, filename, mimeType, size: data.length, data, ...meta, title: meta.title ?? file.name.slice(0, 200) })
  return { url: `${UPLOAD_URL_PREFIX}${folder}/${filename}`, filename, size: data.length }
}
