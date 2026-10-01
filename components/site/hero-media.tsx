'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { resolveImageSrc } from '@/lib/image'

/**
 * Full-bleed hero photograph: the frame opens on load, the image settles into a slow Ken Burns
 * drift, and it parallaxes away as the visitor scrolls. Forest gradients keep copy legible.
 */
export function HeroMedia({ src, alt = '', children }: { src: string; alt?: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '24%'])
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.55])

  return (
    <div ref={ref} className="hero-frame absolute inset-0 -z-10 overflow-hidden bg-forest-950">
      <motion.div style={{ y }} className="absolute inset-0 will-change-transform">
        <div className="hero-kenburns absolute inset-0">
          <Image src={resolveImageSrc(src)} alt={alt} fill priority sizes="100vw" quality={85} className="object-cover saturate-[0.78] contrast-[1.04]" />
        </div>
      </motion.div>
      {/* Forest colour grade so every photograph sits inside the brand palette */}
      <div className="absolute inset-0 bg-forest-800/30 mix-blend-multiply" />
      <div className="absolute inset-0 bg-forest-950/80 md:bg-transparent md:bg-[linear-gradient(90deg,rgb(26_38_32/0.95)_0%,rgb(26_38_32/0.82)_34%,rgb(26_38_32/0.42)_70%,rgb(26_38_32/0.3)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(26_38_32/0.6)_0%,transparent_28%,transparent_58%,rgb(26_38_32/0.9)_100%)]" />
      <div className="hero-sweep absolute inset-0 mix-blend-screen motion-reduce:hidden" />
      <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-forest-950" />
      {children}
    </div>
  )
}
