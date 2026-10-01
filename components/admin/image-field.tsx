'use client'

import { useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ImageUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UPLOAD_MAX_BYTES, UPLOAD_MIME_TYPES, type UploadFolder } from '@/lib/constants'
import { resolveImageSrc } from '@/lib/image'
import { cn } from '@/lib/utils'

function readDimensions(file: File) {
  return new Promise<{ width: number; height: number } | null>((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

/** Uploads straight to MongoDB via /api/upload and hands back the public /api/uploads/… URL. */
export async function uploadImage(file: File, folder: UploadFolder, alt = '') {
  if (!(UPLOAD_MIME_TYPES as readonly string[]).includes(file.type)) throw new Error('Use a JPEG, PNG, WebP or GIF image')
  if (file.size > UPLOAD_MAX_BYTES) throw new Error('Images must be 8 MB or smaller')
  const body = new FormData()
  body.append('file', file)
  body.append('folder', folder)
  body.append('alt', alt)
  const dims = await readDimensions(file)
  if (dims) {
    body.append('width', String(dims.width))
    body.append('height', String(dims.height))
  }
  const res = await fetch('/api/upload', { method: 'POST', body })
  const json = (await res.json().catch(() => ({}))) as { success?: boolean; url?: string; error?: string }
  if (!res.ok || !json.success || !json.url) throw new Error(json.error || 'Upload failed')
  return json.url
}

export function ImageField({
  label,
  value,
  onChange,
  folder = 'misc',
  help,
  error,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  folder?: UploadFolder
  help?: string
  error?: string
}) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const pick = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
      toast.success('Image uploaded — save to apply it')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="grid gap-2">
      <span id={`${id}-label`} className="text-sm font-medium text-forest-900">{label}</span>
      <div
        className={cn('flex items-center gap-4 rounded-sm border border-dashed p-3', error ? 'border-danger' : 'border-forest-900/20')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          pick(e.dataTransfer.files[0])
        }}
      >
        <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-sm bg-sage/60">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary uploads
            <img src={resolveImageSrc(value)} alt="" className="size-full object-cover" />
          ) : (
            <ImageUp aria-hidden className="size-6 text-pebble" strokeWidth={1.5} />
          )}
          {uploading && (
            <span className="absolute inset-0 grid place-items-center bg-white/70">
              <Loader2 aria-label="Uploading" className="size-5 animate-spin text-moss" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-slate">{value ? value.split('/').pop()?.split('?')[0] : 'No image selected'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => input.current?.click()}>
              {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
            </Button>
            {value && (
              <Button type="button" size="sm" variant="quiet" disabled={uploading} onClick={() => onChange('')} className="text-danger">
                Remove
              </Button>
            )}
          </div>
        </div>
        <input
          ref={input}
          type="file"
          accept={UPLOAD_MIME_TYPES.join(',')}
          className="sr-only"
          aria-labelledby={`${id}-label`}
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : <p className="text-xs text-pebble">{help ?? 'JPEG, PNG, WebP or GIF up to 8 MB. Drag and drop works too.'}</p>}
    </div>
  )
}
