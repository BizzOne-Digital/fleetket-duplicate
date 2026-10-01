'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { resolveImageSrc } from '@/lib/image'
import { cn } from '@/lib/utils'

/** Full-width cross-fading slider with a centred headline, as on the fleeket.com home page. */
export function HeroSlider({ slides, children }: { slides: { image: string; heading: string }[]; children?: React.ReactNode }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [paused, slides.length])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Fleeket highlights"
      className="relative h-[560px] overflow-hidden bg-ink md:h-[480px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div key={i} className="slide absolute inset-0" data-active={i === active} aria-hidden={i !== active} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
          <Image src={resolveImageSrc(s.image)} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="container-x relative flex h-full items-center justify-center pb-[17rem] md:pb-20">
            <h1 className="max-w-4xl text-balance text-center text-[1.625rem] font-bold leading-tight text-white sm:text-[2.25rem]">{s.heading}</h1>
          </div>
        </div>
      ))}

      {children && <div className="container-x absolute inset-x-0 bottom-8 z-10">{children}</div>}

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={cn('size-2.5 rounded-full border border-white transition-colors', i === active ? 'bg-white' : 'bg-white/20 hover:bg-white/60')}
            />
          ))}
        </div>
      )}
    </section>
  )
}
