import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { isAdminRole, isUploadFolder } from '@/lib/constants'
import { rateLimited } from '@/lib/rate-limit'
import { storeImage } from '@/lib/uploads'

export const runtime = 'nodejs'

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

  const num = (k: string) => {
    const n = Number(form.get(k))
    return Number.isFinite(n) && n > 0 && n < 50000 ? Math.round(n) : undefined
  }
  const stored = await storeImage(file, folder, {
    meta: { width: num('width'), height: num('height'), alt: String(form.get('alt') ?? '').slice(0, 300), title: form.get('title') ? String(form.get('title')).slice(0, 200) : undefined },
  })
  if ('error' in stored) return fail(stored.error, stored.status)
  return NextResponse.json({ success: true, ...stored, folder })
}
