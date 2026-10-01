'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { motion, useMotionValue, useSpring } from 'motion/react'

declare global {
  interface Window {
    fkLenis?: Lenis
  }
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Scroll to an in-page target, landing exactly where its CSS `scroll-margin-top` says (e.g. `scroll-mt-28`),
 * so every anchor clears the fixed header by the same, single offset.
 */
export function scrollToElement(el: HTMLElement) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  const top = el.getBoundingClientRect().top + window.scrollY - margin
  if (window.fkLenis) window.fkLenis.scrollTo(top, { duration: 1.1 })
  else window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' })
}

/** Inertial smooth scrolling for the public site. Off for reduced-motion users and on touch devices (native is better there). */
export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (reducedMotion()) return
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    window.fkLenis = lenis
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    })
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      window.fkLenis = undefined
    }
  }, [])

  // Same-page hash links glide to their target and respect its scroll margin (works with or without Lenis).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href*="#"]')
      if (!a) return
      const url = new URL(a.href, location.href)
      if (url.pathname !== location.pathname || !url.hash) return
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)))
      if (!el) return
      e.preventDefault()
      history.replaceState(null, '', url.hash)
      scrollToElement(el)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // New page → start at the top immediately rather than gliding from the old position.
  useEffect(() => {
    window.fkLenis?.scrollTo(0, { immediate: true })
  }, [pathname])

  return null
}

/**
 * A soft trailing ring that follows the pointer and swells over anything interactive.
 * Purely decorative: the native cursor stays visible, so nothing depends on it.
 */
export function CursorHalo() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.5 })
  const scale = useMotionValue(1)
  const ss = useSpring(scale, { stiffness: 300, damping: 24 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || reducedMotion()) return
    ref.current?.style.setProperty('display', 'block')
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const interactive = (e.target as HTMLElement | null)?.closest('a, button, [role="option"], select, label, summary')
      scale.set(interactive ? 1.9 : 1)
    }
    const leave = () => scale.set(0)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [x, y, scale])

  return (
    <motion.div
      ref={ref}
      aria-hidden
      style={{ x: sx, y: sy, scale: ss, display: 'none' }}
      className="pointer-events-none fixed left-0 top-0 z-[90] -ml-5 -mt-5 size-10 rounded-full border border-white mix-blend-difference"
    />
  )
}
