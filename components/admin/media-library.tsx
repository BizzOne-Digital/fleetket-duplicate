'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Copy, Loader2, Upload } from 'lucide-react'
import { deleteMedia, updateMedia } from '@/app/actions/admin'
import { uploadImage } from '@/components/admin/image-field'
import { ConfirmButton } from '@/components/admin/confirm'
import { EmptyState, adminInput, formatBytes, formatDate } from '@/components/admin/ui'
import { Button } from '@/components/ui/button'
import { UPLOAD_FOLDERS, UPLOAD_MIME_TYPES, type UploadFolder } from '@/lib/constants'
import { cn } from '@/lib/utils'

type MediaFile = { id: string; url: string; folder: string; filename: string; size: number; width: number | null; height: number | null; alt: string; title: string; description: string; createdAt: string }

export function MediaLibrary({ files, folder, page, pages, total }: { files: MediaFile[]; folder: string; page: number; pages: number; total: number }) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [target, setTarget] = useState<UploadFolder>((folder as UploadFolder) || 'gallery')
  const [uploading, setUploading] = useState(0)
  const [editing, setEditing] = useState<MediaFile | null>(null)
  const [pending, start] = useTransition()

  const upload = async (list: FileList | null) => {
    if (!list?.length) return
    const all = [...list]
    setUploading(all.length)
    let ok = 0
    for (const file of all) {
      try {
        await uploadImage(file, target)
        ok++
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`)
      }
      setUploading((n) => n - 1)
    }
    if (ok) toast.success(`${ok} ${ok === 1 ? 'image' : 'images'} uploaded`)
    if (input.current) input.current.value = ''
    router.refresh()
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-md border border-forest-900/10 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Folders" className="flex flex-wrap gap-1">
          {['', ...UPLOAD_FOLDERS].map((f) => (
            <Link key={f || 'all'} href={f ? `/admin/media?folder=${f}` : '/admin/media'} className={cn('rounded-sm px-3 py-1.5 text-sm capitalize', folder === f ? 'bg-forest-900 text-cream' : 'text-slate hover:text-forest-900')}>
              {f || `All (${total})`}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate">
            <span className="sr-only">Upload to folder</span>
            <select value={target} onChange={(e) => setTarget(e.target.value as UploadFolder)} className="h-9 rounded-sm border border-forest-900/15 bg-white px-2 text-sm capitalize">
              {UPLOAD_FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <Button size="sm" variant="dark" disabled={uploading > 0} onClick={() => input.current?.click()}>
            <span className="inline-flex items-center gap-2">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {uploading ? `Uploading ${uploading}…` : 'Upload images'}
            </span>
          </Button>
          <input ref={input} type="file" multiple accept={UPLOAD_MIME_TYPES.join(',')} className="sr-only" aria-label="Upload images" onChange={(e) => upload(e.target.files)} />
        </div>
      </div>

      {files.length === 0 ? (
        <div className="rounded-md border border-forest-900/10 bg-white">
          <EmptyState title="No images here yet" body="Upload images to use them on pages, categories and areas." />
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((f) => (
            <li key={f.id} className="group overflow-hidden rounded-md border border-forest-900/10 bg-white">
              <button type="button" onClick={() => setEditing(f)} className="relative block aspect-[4/3] w-full overflow-hidden bg-sage/50" aria-label={`Edit details for ${f.title || f.filename}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails of arbitrary admin uploads */}
                <img src={f.url} alt={f.alt} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                {!f.alt && <span className="absolute left-2 top-2 rounded-sm bg-amber-500 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-forest-900">No alt text</span>}
              </button>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-forest-900">{f.title || f.filename}</p>
                <p className="text-xs text-pebble">{f.folder} · {formatBytes(f.size)}{f.width ? ` · ${f.width}×${f.height}` : ''}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="flex justify-between text-sm">
          <span className="text-slate">Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link className="rounded-sm border border-forest-900/15 px-3 py-1.5" href={`/admin/media?${new URLSearchParams({ ...(folder && { folder }), page: String(page - 1) })}`}>Previous</Link>}
            {page < pages && <Link className="rounded-sm border border-forest-900/15 px-3 py-1.5" href={`/admin/media?${new URLSearchParams({ ...(folder && { folder }), page: String(page + 1) })}`}>Next</Link>}
          </div>
        </nav>
      )}

      {editing && (
        <div role="dialog" aria-modal="true" aria-label="Image details" className="fixed inset-0 z-50 grid place-items-center bg-forest-950/50 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <form
            className="grid max-h-[90vh] w-full max-w-3xl overflow-auto rounded-md bg-white text-forest-900 shadow-[var(--shadow-card)] md:grid-cols-2"
            onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}
            onSubmit={(e) => {
              e.preventDefault()
              const data = Object.fromEntries(new FormData(e.currentTarget))
              start(async () => {
                const res = await updateMedia(editing.id, data)
                res.ok ? toast.success(res.message) : toast.error(res.message)
                if (res.ok) setEditing(null)
                router.refresh()
              })
            }}
          >
            <div className="bg-sage/50">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
              <img src={editing.url} alt={editing.alt} className="size-full max-h-[50vh] object-contain md:max-h-none" />
            </div>
            <div className="grid content-start gap-4 p-6">
              <div className="text-xs text-pebble">
                {editing.filename} · {formatBytes(editing.size)}{editing.width ? ` · ${editing.width}×${editing.height}px` : ''} · {formatDate(editing.createdAt)}
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-sm border border-forest-900/15 px-3 py-2 text-left text-sm text-slate hover:text-forest-900"
                onClick={() => navigator.clipboard.writeText(editing.url).then(() => toast.success('URL copied'))}
              >
                <Copy className="size-4 shrink-0" /> <span className="truncate">{editing.url}</span>
              </button>
              {([
                ['alt', 'Alt text', 'Describe the image for screen readers and search engines.'],
                ['title', 'Title', ''],
              ] as const).map(([name, label, help]) => (
                <div key={name} className="grid gap-1.5">
                  <label htmlFor={`m-${name}`} className="text-sm font-medium">{label}</label>
                  <input id={`m-${name}`} name={name} defaultValue={editing[name]} className={adminInput} autoFocus={name === 'alt'} />
                  {help && <span className="text-xs text-pebble">{help}</span>}
                </div>
              ))}
              <div className="grid gap-1.5">
                <label htmlFor="m-description" className="text-sm font-medium">Description</label>
                <textarea id="m-description" name="description" rows={3} defaultValue={editing.description} className={cn(adminInput, 'h-auto py-2')} />
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-2">
                <ConfirmButton
                  title="Delete this image?"
                  body="Anywhere it’s still used will show a placeholder instead. This can’t be undone."
                  className="text-danger"
                  onConfirm={() =>
                    start(async () => {
                      const res = await deleteMedia(editing.url)
                      res.ok ? toast.success(res.message) : toast.error(res.message)
                      setEditing(null)
                      router.refresh()
                    })
                  }
                >
                  Delete
                </ConfirmButton>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button type="submit" size="sm" variant="dark" disabled={pending}>Save details</Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
