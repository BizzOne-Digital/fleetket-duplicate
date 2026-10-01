import { connectDb } from '@/lib/db'
import { StoredUpload } from '@/lib/models'
import { isUploadFolder } from '@/lib/constants'
import { isSafeFilename } from '@/lib/uploads'

export const runtime = 'nodejs'

export async function GET(_req: Request, ctx: RouteContext<'/api/uploads/[folder]/[filename]'>) {
  const { folder, filename } = await ctx.params
  if (!isUploadFolder(folder) || !isSafeFilename(filename) || filename.includes('/')) {
    return new Response('Not found', { status: 404 })
  }

  await connectDb()
  const doc = await StoredUpload.findOne({ folder, filename }).select('+data mimeType size').lean()
  if (!doc?.data) return new Response('Not found', { status: 404 })

  const body = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from((doc.data as { buffer: ArrayBuffer }).buffer)
  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Length': String(body.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
