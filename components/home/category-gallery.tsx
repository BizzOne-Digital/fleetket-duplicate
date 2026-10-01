'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { ButtonLink } from '@/components/ui/button'
import { resolveImageSrc } from '@/lib/image'

export type GalleryGroup = { name: string; image: string; categories: { name: string; slug: string }[] }

/**
 * Pinned horizontal gallery: on desktop, vertical scroll drives the track sideways while the
 * section stays fixed. On touch/small screens it falls back to a native swipe rail with snap points.
 */
export function CategoryGallery({ groups, total }: { groups: GalleryGroup[]; total: number }) {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      const pin = window.matchMedia('(min-width: 1024px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setDistance(pin && track.current ? Math.max(0, track.current.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(track.current).paddingRight)) : 0)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [groups.length])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  const x = useTransform(smooth, (v) => -v * distance)
  const bar = useTransform(smooth, [0, 1], ['0%', '100%'])

  return (
    <section ref={section} style={distance ? { height: `calc(100vh + ${distance}px)` } : undefined} className="relative bg-forest-900">
      <div className={distance ? 'sticky top-0 flex h-screen flex-col justify-center overflow-hidden' : 'py-24'}>
        <motion.div
          ref={track}
          style={distance ? { x } : undefined}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] lg:snap-none lg:gap-6 lg:overflow-visible"
        >
          <div className="flex w-[78vw] shrink-0 snap-start flex-col justify-between py-2 sm:w-[46vw] lg:w-[34vw] lg:pr-10">
            <div>
              <p className="t-eyebrow flex items-center gap-3 text-lime">
                <span className="h-px w-10 bg-lime/70" />
                Explore services
              </p>
              <h2 className="t-h1 mt-8 text-cream">
                {total} categories.
                <br />
                <span className="accent-serif text-lime">One place</span> to look.
              </h2>
            </div>
            <div className="mt-10">
              <p className="max-w-sm leading-relaxed text-fog">From the driveway to the dinner party — every kind of help, organised so you can find it in seconds.</p>
              <ButtonLink href="/services" className="mt-8" arrow>All services</ButtonLink>
            </div>
          </div>

          {groups.map((g, i) => (
            <article key={g.name} className="group relative h-[64vh] min-h-[26rem] w-[78vw] shrink-0 snap-start overflow-hidden rounded-md bg-forest-800 sm:w-[46vw] lg:h-[72vh] lg:w-[30vw]">
              <Image
                src={resolveImageSrc(g.image)}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, 78vw"
                className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/45 to-forest-950/10" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6 text-sm text-cream/70">
                <span className="t-index">{String(i + 1).padStart(2, '0')}</span>
                <span>{g.categories.length} categories</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-7">
                <h3 className="font-display text-[clamp(1.75rem,2.6vw,2.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-cream">{g.name}</h3>
                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-cream/15 pt-5">
                  {g.categories.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/services/${c.slug}`} className="text-sm text-cream/80 underline decoration-cream/20 underline-offset-4 transition-colors hover:text-lime hover:decoration-lime">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
          {/* Trailing gutter — flex containers don't count end padding toward scrollWidth. */}
          <div aria-hidden className="w-px shrink-0" />
        </motion.div>

        {distance > 0 && (
          <div className="container-x mt-10 flex items-center gap-6">
            <span className="t-eyebrow text-[0.625rem] text-cream/50">Scroll to explore</span>
            <span className="relative h-px flex-1 bg-cream/15">
              <motion.span style={{ width: bar }} className="absolute inset-y-0 left-0 bg-lime" />
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
