'use client'

import { Fragment, useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

/** Fade-and-lift on first view. The workhorse — used sparingly so sections have calm between movement. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = 'div',
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'span'
}) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </Tag>
  )
}

/** Image wipe: clip from the bottom while the image settles from a slight zoom. */
export function ImageReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1], delay }}
    >
      <motion.div
        className="size-full"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.8, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/** Subtle vertical drift tied to scroll position. */
export function Parallax({ children, className, distance = 60 }: { children: React.ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance])
  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <motion.div style={{ y, height: `calc(100% + ${distance * 2}px)`, marginTop: -distance }} className="w-full">
        {children}
      </motion.div>
    </div>
  )
}

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <span className="relative inline-block">
      <motion.span style={{ opacity }}>{word}</motion.span>&nbsp;
    </span>
  )
}

/** Statement copy that lights up word by word as it scrolls through the viewport. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(/\s+/)
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </span>
    </p>
  )
}

/** Oversized type that slides sideways as its section scrolls through the viewport. */
export function ScrollMarquee({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], ['8%', '-38%'])
  return (
    <div ref={ref} aria-hidden className="pointer-events-none select-none overflow-hidden whitespace-nowrap">
      <motion.div style={{ x }} className={className}>
        {text} · {text}
      </motion.div>
    </div>
  )
}

/** Section heading whose words rise out of a mask in sequence when it enters the viewport. */
export function SplitReveal({ text, className, as = 'h2', delay = 0 }: { text: string; className?: string; as?: 'h2' | 'h3' | 'p'; delay?: number }) {
  const Tag = motion[as]
  const words = text.split(/\s+/)
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ staggerChildren: 0.055, delayChildren: delay }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
              <motion.span
                className="inline-block"
                variants={{ hidden: { y: '110%', rotate: 4 }, show: { y: '0%', rotate: 0, transition: { duration: 1, ease: EASE } } }}
              >
                {w}
              </motion.span>
            </span>{' '}
          </Fragment>
        ))}
      </span>
    </Tag>
  )
}

/** Gentle pull toward the pointer — reserved for the primary call to action. */
export function Magnetic({ children, strength = 0.25, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(0, { stiffness: 260, damping: 18 })
  const y = useSpring(0, { stiffness: 260, damping: 18 })
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={cn('inline-block', className)}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = ref.current!.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
