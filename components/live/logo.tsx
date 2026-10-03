import Image from 'next/image'
import { cn } from '@/lib/utils'
import logo from '@/public/fleeket-logo.png'

/** The Fleeket badge — cropped from public/fleeket.jpeg with a transparent background. */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return <Image src={logo} alt="Fleeket" priority={priority} sizes="240px" className={cn('h-8 w-auto', className)} />
}
