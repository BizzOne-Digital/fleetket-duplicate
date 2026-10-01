'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ConfirmButton } from '@/components/admin/confirm'

export function DeleteResourceButton({
  resource,
  id,
  singular,
  action,
}: {
  resource: string
  id: string
  singular: string
  action: (resource: string, ids: string[]) => Promise<{ ok: boolean; message: string }>
}) {
  const router = useRouter()
  return (
    <ConfirmButton
      title={`Delete this ${singular.toLowerCase()}?`}
      body="It will be removed from the site immediately. This can’t be undone."
      className="text-danger"
      onConfirm={async () => {
        const res = await action(resource, [id])
        if (!res.ok) return void toast.error(res.message)
        toast.success(res.message)
        router.push(`/admin/${resource}`)
      }}
    >
      Delete
    </ConfirmButton>
  )
}
