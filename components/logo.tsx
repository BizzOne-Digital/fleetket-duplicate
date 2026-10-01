import { cn } from '@/lib/utils'

/**
 * Fleeket mark: the elongated hexagon from the original brand badge, redrawn as an open
 * outline with two nodes — one need, one provider — joined by a single connection.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 40 28" className={cn('h-7 w-10', className)} fill="none" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path d="M9 1.5h22l7.5 12.5L31 26.5H9L1.5 14 9 1.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12.5 14h15" stroke="var(--color-moss)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12.5" cy="14" r="2.6" fill="currentColor" />
      <circle cx="27.5" cy="14" r="2.6" fill="var(--color-moss)" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="font-display text-[1.375rem] font-semibold leading-none tracking-[-0.04em]">Fleeket</span>
    </span>
  )
}
