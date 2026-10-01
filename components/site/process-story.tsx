'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Lock, Mail, MapPin, Search } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import { cn } from '@/lib/utils'

type Stage = { title: string; body: string; detail: string }

/* Illustrative product panels — clearly UI sketches, no real data or claims. */
function Panel({ index, price }: { index: number; price: string }) {
  const shell = 'rounded-md border border-white/10 bg-forest-850 p-6 shadow-[var(--shadow-lift)] sm:p-8'
  const line = (w: string) => <span className={cn('block h-2 rounded-full bg-white/10', w)} />
  switch (index) {
    case 0:
      return (
        <div className={shell}>
          <p className="font-display text-lg font-semibold text-cream">Create your account</p>
          <div className="mt-6 grid gap-3">
            {['Full name', 'Email address', 'Password'].map((l) => (
              <div key={l} className="rounded-sm border border-white/10 px-4 py-3 text-sm text-haze">{l}</div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-sm border border-lime/50 bg-lime/10 px-4 py-3 text-cream">I need a service</div>
            <div className="rounded-sm border border-white/10 px-4 py-3 text-fog">I offer a service</div>
          </div>
          <div className="mt-5 rounded-sm bg-lime px-4 py-3 text-center text-sm font-medium text-forest-900">Create account</div>
        </div>
      )
    case 1:
      return (
        <div className={shell}>
          <div className="flex items-center gap-3 rounded-sm border border-lime/40 px-4 py-3 text-sm text-cream">
            <Search className="size-4 text-fog" aria-hidden /> Moving help
            <span className="ml-auto flex items-center gap-1.5 text-fog"><MapPin className="size-3.5" aria-hidden /> Nova Scotia</span>
          </div>
          <ul className="mt-5 grid gap-2">
            {[['truck', 'Moving Services'], ['spray-can', 'Move-out cleaning'], ['monitor-smartphone', 'TV & appliance setup']].map(([icon, name], i) => (
              <li key={name} className={cn('flex items-center gap-4 rounded-sm border px-4 py-3.5', i === 0 ? 'border-white/15 bg-white/[0.04]' : 'border-white/[0.06]')}>
                <span className="grid size-9 place-items-center rounded-sm bg-white/[0.06] text-lime"><CategoryIcon name={icon} className="size-4" /></span>
                <span className="flex-1">
                  <span className="block text-sm text-cream">{name}</span>
                  <span className="mt-1.5 block">{line('w-24')}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )
    case 2:
      return (
        <div className={shell}>
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-sm bg-white/[0.06] text-lime"><CategoryIcon name="truck" className="size-5" /></span>
            <span className="flex-1 space-y-2">{line('w-32')}{line('w-20')}</span>
            <Lock className="size-4 text-haze" aria-hidden />
          </div>
          <div className="mt-6 space-y-3 border-y border-white/10 py-5 text-sm">
            <div className="flex justify-between text-fog"><span>Provider connection</span><span className="text-cream">{price}</span></div>
            <div className="flex justify-between text-fog"><span>Contact details</span><span>Delivered by email</span></div>
          </div>
          <div className="mt-5 rounded-sm bg-lime px-4 py-3 text-center text-sm font-medium text-forest-900">Secure checkout</div>
        </div>
      )
    default:
      return (
        <div className={shell}>
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <span className="grid size-10 place-items-center rounded-full bg-moss/15 text-lime"><Mail className="size-4" aria-hidden /></span>
            <span>
              <span className="block text-sm text-cream">Your provider’s contact details</span>
              <span className="text-xs text-haze">From Fleeket</span>
            </span>
          </div>
          <div className="mt-5 space-y-3">{line('w-full')}{line('w-5/6')}{line('w-2/3')}</div>
          <div className="mt-6 flex items-center gap-2 rounded-sm border border-success/30 bg-success/10 px-4 py-3 text-sm text-mist">
            <Check className="size-4 text-success" aria-hidden /> Ready to connect
          </div>
        </div>
      )
  }
}

export function ProcessStory({ stages, price }: { stages: Stage[]; price: string }) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [stages.length])

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-[calc(50vh-13rem)]">
          <div className="mb-8 flex gap-2" aria-hidden>
            {stages.map((_, i) => (
              <span key={i} className="h-px flex-1 overflow-hidden bg-white/10">
                <span className={cn('block h-px bg-lime transition-transform duration-700 ease-[var(--ease-out-expo)] origin-left', i <= active ? 'scale-x-100' : 'scale-x-0')} />
              </span>
            ))}
          </div>
          <div className="relative min-h-[22rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden
              >
                <Panel index={active} price={price} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ol className="lg:col-span-6 lg:col-start-7">
        {stages.map((s, i) => (
          <li
            key={s.title}
            data-index={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            className="flex flex-col justify-center border-t border-white/10 py-14 first:border-t-0 lg:min-h-[72vh]"
          >
            <span className={cn('font-display text-7xl font-semibold tracking-[-0.06em] transition-colors duration-700', active === i ? 'text-moss' : 'text-white/10')}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <h2 className={cn('t-h2 mt-8 transition-colors duration-700', active === i ? 'text-cream' : 'text-cream/40')}>{s.title}</h2>
            <p className={cn('t-lead mt-5 max-w-lg transition-colors duration-700', active === i ? 'text-fog' : 'text-fog/50')}>{s.body}</p>
            {s.detail && <p className="t-eyebrow mt-8 text-lime">{s.detail}</p>}
            <div className="mt-10 lg:hidden" aria-hidden>
              <Panel index={i} price={price} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
