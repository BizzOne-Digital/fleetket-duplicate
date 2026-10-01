'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'

/** Native <dialog> confirmation — focus trapping and Escape handling come from the browser. */
export function ConfirmButton({
  children,
  title,
  body,
  confirmLabel = 'Delete',
  onConfirm,
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
}: {
  children: React.ReactNode
  title: string
  body: string
  confirmLabel?: string
  onConfirm: () => void | Promise<void>
  variant?: 'outline' | 'danger' | 'quiet'
  size?: 'sm' | 'md'
  className?: string
  disabled?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} disabled={disabled} onClick={() => ref.current?.showModal()}>
        {children}
      </Button>
      <dialog
        ref={ref}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-md border border-forest-900/10 bg-white p-0 text-forest-900 shadow-[var(--shadow-card)] backdrop:bg-forest-950/50 backdrop:backdrop-blur-sm"
        onClick={(e) => e.target === ref.current && ref.current?.close()}
      >
        <div className="p-6">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate">{body}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.close()} autoFocus>Cancel</Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={async () => {
                ref.current?.close()
                await onConfirm()
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  )
}
