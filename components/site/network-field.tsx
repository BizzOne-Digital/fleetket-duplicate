'use client'

import { useEffect, useRef } from 'react'

type Props = { labels: string[]; className?: string; density?: 'full' | 'calm' }

type Hub = { x: number; z: number }
type Arc = { from: Hub; to: Hub; t: number; label: string; speed: number }
type Pulse = { hub: Hub; t: number; label: string }

/**
 * A perspective dot-terrain drifting toward the viewer, with arcs travelling between hubs —
 * a quiet visual for “needs meeting providers across a region”. Pure 2D canvas, no WebGL.
 * Pauses offscreen and renders a single still frame for reduced-motion users.
 */
export function NetworkField({ labels, className, density = 'full' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.innerWidth < 768
    const COLS = small ? 26 : density === 'full' ? 46 : 34
    const ROWS = small ? 22 : 30
    const SPAN_X = 34 // world units either side
    const NEAR = 2.2
    const FAR = 40
    const CAM_H = 2.6
    const SPEED = 0.55 // world units per second

    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let last = performance.now()
    let offset = 0
    let visible = true
    let pointerX = 0
    let camX = 0

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const font = `500 11px ${getComputedStyle(canvas).fontFamily}`
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const hubs: Hub[] = Array.from({ length: small ? 7 : 12 }, () => ({ x: rand(-SPAN_X * 0.7, SPAN_X * 0.7), z: rand(NEAR + 3, FAR * 0.8) }))
    const arcs: Arc[] = []
    const pulses: Pulse[] = []
    let nextArc = 0.4

    const elevation = (x: number, z: number, t: number) => Math.sin(x * 0.22 + t * 0.25) * Math.cos(z * 0.18 - t * 0.15) * 0.35

    const project = (x: number, y: number, z: number) => {
      const f = h * 0.9
      const horizon = h * 0.3
      return { sx: w / 2 + ((x - camX) * f) / z, sy: horizon + ((CAM_H - y) * f) / z, s: f / z }
    }

    const wrapZ = (z: number) => {
      const range = FAR - NEAR
      return NEAR + ((((z - NEAR - offset) % range) + range) % range)
    }

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h)
      camX += (pointerX * 2.2 - camX) * Math.min(1, dt * 1.8)

      // Terrain dots
      const stepX = (SPAN_X * 2) / (COLS - 1)
      const stepZ = (FAR - NEAR) / ROWS
      for (let r = 0; r < ROWS; r++) {
        const z = wrapZ(NEAR + r * stepZ)
        const depth = (z - NEAR) / (FAR - NEAR) // 0 near → 1 far
        const fade = Math.min(1, depth * 6) * (1 - depth) ** 1.4
        if (fade < 0.02) continue
        for (let c = 0; c < COLS; c++) {
          const x = -SPAN_X + c * stepX
          const p = project(x, elevation(x, z, t), z)
          if (p.sx < -10 || p.sx > w + 10 || p.sy > h + 10) continue
          const edge = 1 - Math.abs(x) / SPAN_X
          const a = fade * edge * 0.95
          if (a < 0.02) continue
          ctx.fillStyle = `rgba(232, 246, 170, ${a * 0.8})`
          const size = Math.min(2.4, Math.max(0.9, p.s * 0.05))
          ctx.fillRect(p.sx - size / 2, p.sy - size / 2, size, size)
        }
      }

      // Hubs ride the terrain
      const hubPos = (hub: Hub) => {
        const z = wrapZ(hub.z)
        return { ...project(hub.x, elevation(hub.x, z, t), z), z }
      }

      for (const hub of hubs) {
        const p = hubPos(hub)
        const depth = (p.z - NEAR) / (FAR - NEAR)
        const a = Math.min(1, depth * 5) * (1 - depth)
        if (a < 0.05) continue
        ctx.fillStyle = `rgba(247, 246, 236, ${a * 0.95})`
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, Math.min(3.2, Math.max(1.6, p.s * 0.075)), 0, Math.PI * 2)
        ctx.fill()
      }

      // Spawn connections
      nextArc -= dt
      if (nextArc <= 0 && arcs.length < (small ? 2 : 4)) {
        const from = hubs[Math.floor(Math.random() * hubs.length)]
        let to = hubs[Math.floor(Math.random() * hubs.length)]
        if (to === from) to = hubs[(hubs.indexOf(from) + 1) % hubs.length]
        arcs.push({ from, to, t: 0, label: labels[Math.floor(Math.random() * labels.length)] ?? '', speed: rand(0.32, 0.5) })
        nextArc = rand(0.9, 1.8)
      }

      // Arcs
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i]
        arc.t += dt * arc.speed
        const a = hubPos(arc.from)
        const b = hubPos(arc.to)
        const visibleA = a.z > NEAR + 0.5 && b.z > NEAR + 0.5
        if (arc.t >= 1 || !visibleA) {
          if (arc.t >= 1 && visibleA) pulses.push({ hub: arc.to, t: 0, label: arc.label })
          arcs.splice(i, 1)
          continue
        }
        const lift = Math.min(220, Math.hypot(b.sx - a.sx, b.sy - a.sy) * 0.55)
        const cx = (a.sx + b.sx) / 2
        const cy = Math.min(a.sy, b.sy) - lift
        const head = Math.min(1, arc.t * 1.25)
        const tail = Math.max(0, arc.t * 1.25 - 0.45)
        const pt = (u: number) => ({
          x: (1 - u) ** 2 * a.sx + 2 * (1 - u) * u * cx + u * u * b.sx,
          y: (1 - u) ** 2 * a.sy + 2 * (1 - u) * u * cy + u * u * b.sy,
        })
        ctx.lineWidth = 1.6
        const steps = 24
        for (let s = 0; s < steps; s++) {
          const u0 = tail + ((head - tail) * s) / steps
          const u1 = tail + ((head - tail) * (s + 1)) / steps
          const p0 = pt(u0)
          const p1 = pt(u1)
          ctx.strokeStyle = `rgba(217, 242, 90, ${(s / steps) * 0.95})`
          ctx.beginPath()
          ctx.moveTo(p0.x, p0.y)
          ctx.lineTo(p1.x, p1.y)
          ctx.stroke()
        }
        const hp = pt(head)
        ctx.fillStyle = 'rgba(247, 246, 236, 1)'
        ctx.beginPath()
        ctx.arc(hp.x, hp.y, 2.6, 0, Math.PI * 2)
        ctx.fill()
      }

      // Arrival pulses with a quiet label
      ctx.font = font
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i]
        pulse.t += dt * 0.6
        if (pulse.t >= 1) {
          pulses.splice(i, 1)
          continue
        }
        const p = hubPos(pulse.hub)
        const ease = 1 - (1 - pulse.t) ** 3
        ctx.strokeStyle = `rgba(217, 242, 90, ${(1 - pulse.t) * 0.9})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, 4 + ease * 26, 0, Math.PI * 2)
        ctx.stroke()
        if (pulse.label && !small) {
          const la = Math.sin(pulse.t * Math.PI)
          ctx.fillStyle = `rgba(247, 246, 236, ${la * 0.9})`
          ctx.fillText(pulse.label.toUpperCase(), p.sx + 12, p.sy - 10)
        }
      }
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      offset += dt * SPEED
      draw(now / 1000, dt)
      raf = visible ? requestAnimationFrame(frame) : 0
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    if (reduced) {
      draw(0, 0)
      return () => ro.disconnect()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === 'visible'
      if (visible && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(canvas)
    const onVis = () => {
      visible = document.visibilityState === 'visible'
      if (visible && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    const onPointer = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [labels, density])

  return <canvas ref={canvasRef} aria-hidden className={className} />
}
