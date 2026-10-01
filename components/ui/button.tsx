import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'group/btn relative inline-flex shrink-0 select-none items-center justify-center gap-2.5 whitespace-nowrap font-medium tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
  {
    variants: {
      variant: {
        primary: 'bg-lime text-forest-900 hover:bg-lime-soft shadow-[0_10px_30px_-12px_rgb(217_242_90/0.65)]',
        light: 'bg-cream text-forest-900 hover:bg-white',
        dark: 'bg-forest-900 text-cream hover:bg-forest-700',
        outline: 'border border-current/25 text-current hover:border-current/70 hover:bg-current/[0.04]',
        quiet: 'text-current/80 hover:text-current',
        danger: 'bg-danger text-white hover:bg-danger/90',
      },
      size: {
        sm: 'h-9 rounded-sm px-3.5 text-sm',
        md: 'h-11 rounded-sm px-5 text-[0.9375rem]',
        lg: 'h-14 rounded-sm px-7 text-base',
        link: 'h-auto p-0 text-[0.9375rem]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type Variants = VariantProps<typeof buttonVariants>
type Common = Variants & { className?: string; children: React.ReactNode; arrow?: boolean }

/** Arrow that slides out and back in on hover — the one motion signature shared by every CTA. */
export function Arrow({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('relative inline-flex size-4 overflow-hidden', className)}>
      {[0, 1].map((i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          className={cn(
            'absolute inset-0 size-4 transition-transform duration-500 ease-[var(--ease-out-expo)]',
            i === 0 ? 'group-hover/btn:translate-x-full' : '-translate-x-full group-hover/btn:translate-x-0',
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 8h11M9 4l4 4-4 4" />
        </svg>
      ))}
    </span>
  )
}

function Inner({ children, arrow }: { children: React.ReactNode; arrow?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {arrow && <Arrow />}
    </>
  )
}

export function Button({
  variant,
  size,
  className,
  children,
  arrow,
  ...props
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  )
}

export function ButtonLink({
  variant,
  size,
  className,
  children,
  arrow,
  href,
  ...props
}: Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  )
}

/** Editorial text link with underline draw + arrow. */
export function TextLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn('group/btn inline-flex items-center gap-2 font-medium', className)}>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-[var(--ease-out-expo)] group-hover/btn:bg-[length:100%_1px]">
        {children}
      </span>
      <Arrow />
    </Link>
  )
}
