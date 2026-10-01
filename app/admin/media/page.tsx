import { AdminHeader } from '@/components/admin/ui'
import { MediaLibrary } from '@/components/admin/media-library'
import { db } from '@/lib/content'
import { StoredUpload } from '@/lib/models'
import { isUploadFolder } from '@/lib/constants'

export const metadata = { title: 'Media library' }
const PAGE_SIZE = 48

export default async function MediaPage({ searchParams }: PageProps<'/admin/media'>) {
  const sp = await searchParams
  const folder = isUploadFolder(sp.folder) ? sp.folder : ''
  const page = Math.max(1, Number(sp.page) || 1)
  await db()
  const filter = folder ? { folder } : {}
  const [total, files] = await Promise.all([
    StoredUpload.countDocuments(filter),
    StoredUpload.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
  ])

  return (
    <div className="grid gap-8">
      <AdminHeader title="Media library" description="Images are stored in the database so they survive redeploys. Replacing an image in an editor removes the old file automatically when you save." />
      <MediaLibrary
        folder={folder}
        page={page}
        pages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        total={total}
        files={files.map((f) => ({
          id: String(f._id),
          url: `/api/uploads/${f.folder}/${f.filename}`,
          folder: f.folder,
          filename: f.filename,
          size: f.size,
          width: f.width ?? null,
          height: f.height ?? null,
          alt: f.alt ?? '',
          title: f.title ?? '',
          description: f.description ?? '',
          createdAt: f.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
