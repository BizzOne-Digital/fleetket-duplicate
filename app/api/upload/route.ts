import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { connectDb } from '@/lib/db'
import { StoredUpload } from '@/lib/models'
import { isAdminRole, isUploadFolder, UPLOAD_MAX_BYTES, UPLOAD_MIME_TYPES } from '@/lib/constants'
import { rateLimited } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

/** Magic-byte check so a renamed file can't pass as an image. */
function sniff(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  if (buf.subarray(0, 4).toString('ascii') === 'GIF8') return 'image/gif'
  return null
}

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status })

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || !isAdminRole(user.role)) return fail('Not authorised', 401)
  if (await rateLimited('upload', 60, 60_000)) return fail('Too many uploads, please wait a minute', 429)

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return fail('Invalid upload', 400)
  }

  const file = form.get('file')
  const folder = form.get('folder')
  if (!isUploadFolder(folder)) return fail('Invalid folder', 400)
  if (!(file instanceof File)) return fail('No file received', 400)
  if (!(UPLOAD_MIME_TYPES as readonly string[]).includes(file.type)) return fail('Only JPEG, PNG, WebP or GIF images are allowed', 415)
  if (file.size > UPLOAD_MAX_BYTES) return fail('Images must be 8 MB or smaller', 413)

  const data = Buffer.from(await file.arrayBuffer())
  const mimeType = sniff(data)
  if (!mimeType || mimeType !== file.type) return fail('File contents do not match an allowed image type', 415)

  const filename = `${Date.now()}-${randomBytes(6).toString('hex')}.${EXT[mimeType]}`
  const num = (k: string) => {
    const n = Number(form.get(k))
    return Number.isFinite(n) && n > 0 && n < 50000 ? Math.round(n) : undefined
  }

  await connectDb()
  await StoredUpload.create({
    folder,
    filename,
    mimeType,
    size: data.length,
    data,
    width: num('width'),
    height: num('height'),
    alt: String(form.get('alt') ?? '').slice(0, 300),
    title: String(form.get('title') ?? file.name).slice(0, 200),
  })

  return NextResponse.json({ success: true, url: `/api/uploads/${folder}/${filename}`, filename, size: data.length, folder })
}
