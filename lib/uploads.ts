import 'server-only'
import { connectDb } from './db'
import { StoredUpload } from './models'
import { UPLOAD_FOLDERS, type UploadFolder } from './constants'

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
