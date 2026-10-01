import { cn } from '@/lib/utils'

/** The fleeket.com badge: red elongated hexagon with the white wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 122" className={cn('h-8 w-auto', className)} role="img" aria-label="Fleeket">
      <path
        fill="#EC1C24"
        d="M405.67 121.69h43.28c5.37 0 10.52-2.13 14.31-5.93l44.37-44.37c5.82-5.82 5.82-15.27 0-21.09L463.26 5.93C459.46 2.13 454.32 0 448.95 0H63.05C57.68 0 52.53 2.13 48.74 5.93L4.37 50.3c-5.82 5.82-5.82 15.27 0 21.09l44.37 44.37c3.8 3.8 8.94 5.93 14.31 5.93h342.62z"
      />
      <path fill="none" stroke="#fff" strokeWidth="7" strokeLinejoin="round" d="M44 34 18 61l26 27M468 34l26 27-26 27" opacity=".9" />
      <text x="256" y="88" textAnchor="middle" fill="#fff" fontFamily="var(--font-poppins), Poppins, sans-serif" fontWeight="700" fontSize="78" letterSpacing="-1">
        Fleeket
      </text>
    </svg>
  )
}
