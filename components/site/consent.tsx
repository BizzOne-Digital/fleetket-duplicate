'use client'

import Link from 'next/link'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LogoMark } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Bump when the Privacy Policy or Terms change materially — every visitor is asked to agree again.
 * Matches the effective date shown on the legal pages.
 */
const TERMS_VERSION = '2026-03-17'

// TEMPORARILY DISABLED: the first-visit Privacy Policy / Terms agreement pop-up.
// Set back to `true` to show it again — nothing else needs to change.
const TERMS_GATE_ENABLED = false

type Consent = { v: 2; terms: string; agreedAt: string; analytics: boolean; marketing: boolean }
const KEY = 'fk-consent'
const OPEN_EVENT = 'fk:open-consent'
const LEGAL_PATHS = ['/privacy', '/terms']

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<Consent>) : null
    return parsed?.v === 2 && parsed.terms === TERMS_VERSION ? (parsed as Consent) : null
  } catch {
    return null
  }
}

/** Footer link that reopens cookie preferences. */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Cookie preferences
    </button>
  )
}

function Toggle({ label, desc, checked, onChange, locked }: { label: string; desc: string; checked: boolean; onChange?: (v: boolean) => void; locked?: boolean }) {
  return (
    <label className={cn('flex items-center justify-between gap-4 py-2.5', !locked && 'cursor-pointer')}>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="text-xs opacity-70">{desc}</span>
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} disabled={locked} onChange={(e) => onChange?.(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-current/20 transition-colors peer-checked:bg-lime peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime peer-disabled:opacity-60" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-cream shadow transition-transform duration-300 ease-[var(--ease-out-expo)] peer-checked:translate-x-5 peer-checked:bg-forest-900" />
      </span>
    </label>
  )
}

/**
 * First visit: a welcome dialog the visitor must accept (Privacy Policy + Terms) before using the site,
 * combined with their cookie choice so it's one decision, not two.
 * Consent-first: GA4 loads only when NEXT_PUBLIC_GA_ID is set AND analytics consent is granted.
 * The legal pages themselves are never blocked, so the documents can always be read first.
 */
export function ConsentManager({ gaId }: { gaId?: string }) {
  const pathname = usePathname()
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const [consent, setConsent] = useState<Consent | null>(null)
  const [ready, setReady] = useState(false)
  const [welcome, setWelcome] = useState(false)
  const [prefs, setPrefs] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [draft, setDraft] = useState({ analytics: false, marketing: false })

  useEffect(() => {
    setConsent(readConsent())
    setReady(true)
    const reopen = () => {
      const c = readConsent()
      if (!c && TERMS_GATE_ENABLED) return setWelcome(true)
      setDraft({ analytics: c?.analytics ?? false, marketing: c?.marketing ?? false })
      setPrefs(true)
    }
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [])

  // Ask on every page until agreed — except the legal pages, which must stay readable.
  useEffect(() => {
    if (!TERMS_GATE_ENABLED || !ready || consent || LEGAL_PATHS.includes(pathname)) return setWelcome(false)
    // Let the launch splash finish first when it is playing.
    const splash = !document.documentElement.classList.contains('splash-seen') && document.querySelector('.splash')
    const t = setTimeout(() => setWelcome(true), splash ? 2600 : 500)
    return () => clearTimeout(t)
  }, [ready, consent, pathname])

  // Native modal dialog: focus is trapped and the page behind is inert.
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (welcome && !el.open) {
      el.showModal()
      window.fkLenis?.stop()
    } else if (!welcome && el.open) {
      el.close()
      window.fkLenis?.start()
    }
  }, [welcome])

  const save = (c: { analytics: boolean; marketing: boolean }) => {
    const value: Consent = { v: 2, terms: TERMS_VERSION, agreedAt: new Date().toISOString(), ...c }
    try {
      localStorage.setItem(KEY, JSON.stringify(value))
    } catch {}
    setConsent(value)
    setWelcome(false)
    setPrefs(false)
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    w.gtag?.('consent', 'update', {
      analytics_storage: value.analytics ? 'granted' : 'denied',
      ad_storage: value.marketing ? 'granted' : 'denied',
      ad_user_data: value.marketing ? 'granted' : 'denied',
      ad_personalization: value.marketing ? 'granted' : 'denied',
    })
  }

  return (
    <>
      {gaId && consent?.analytics && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
gtag('consent','default',{analytics_storage:'granted',ad_storage:'${consent.marketing ? 'granted' : 'denied'}',ad_user_data:'${consent.marketing ? 'granted' : 'denied'}',ad_personalization:'${consent.marketing ? 'granted' : 'denied'}'});
gtag('js',new Date());gtag('config',${JSON.stringify(gaId)},{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {/* First-visit agreement */}
      <dialog
        ref={dialog}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        onCancel={(e) => e.preventDefault()} // Escape can't skip the agreement
        className="m-auto w-[min(34rem,calc(100vw-2rem))] max-h-[calc(100svh-2rem)] overflow-y-auto rounded-md bg-cream p-0 text-forest-900 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.7)] backdrop:bg-forest-950/75 backdrop:backdrop-blur-md"
      >
        {welcome && (
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <div className="relative overflow-hidden bg-forest-900 px-7 pb-7 pt-8 text-cream sm:px-9">
              <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-[radial-gradient(closest-side,rgb(217_242_90/0.25),transparent)]" />
              <LogoMark className="relative h-7 w-10 text-cream" />
              <p className="t-eyebrow relative mt-6 text-lime">Welcome to Fleeket</p>
              <h2 id={`${id}-title`} className="relative mt-3 font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.035em]">
                Before you continue
              </h2>
            </div>

            <div className="px-7 py-7 sm:px-9">
              <p id={`${id}-desc`} className="leading-relaxed text-slate">
                To use Fleeket, please review and accept how we handle your information and the terms that apply to using the site.
              </p>

              <label className="mt-6 flex cursor-pointer items-start gap-3.5 rounded-sm border border-sage bg-paper p-4 transition-colors has-[:checked]:border-moss/50 has-[:checked]:bg-lime/25">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  aria-describedby={`${id}-hint`}
                  className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-forest-900)]"
                  autoFocus
                />
                <span className="text-[0.9375rem] leading-relaxed">
                  I have read and agree to the{' '}
                  <Link href="/privacy" className="font-medium underline underline-offset-2 hover:text-moss">Privacy Policy</Link> and{' '}
                  <Link href="/terms" className="font-medium underline underline-offset-2 hover:text-moss">Terms &amp; Conditions</Link>.
                </span>
              </label>

              <div className="mt-6 border-t border-sage pt-5">
                <p className="text-sm font-semibold">Cookies</p>
                <p className="mt-1 text-sm text-slate">Essential cookies keep the site running. Analytics and advertising cookies are optional.</p>
                <div className="mt-2 divide-y divide-sage">
                  <Toggle label="Essential" desc="Sign-in, security and your choices" checked locked />
                  <Toggle label="Analytics" desc="Help us understand how the site is used" checked={draft.analytics} onChange={(v) => setDraft((d) => ({ ...d, analytics: v }))} />
                  <Toggle label="Advertising" desc="Measure campaigns and relevance" checked={draft.marketing} onChange={(v) => setDraft((d) => ({ ...d, marketing: v }))} />
                </div>
              </div>

              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                <Button variant="dark" disabled={!agreed} onClick={() => save({ analytics: true, marketing: true })}>
                  Accept all &amp; continue
                </Button>
                <Button variant="outline" disabled={!agreed} onClick={() => save(draft)}>
                  {draft.analytics || draft.marketing ? 'Save & continue' : 'Essential only'}
                </Button>
              </div>
              <p id={`${id}-hint`} aria-live="polite" className={cn('mt-3 text-center text-xs text-slate transition-opacity', agreed && 'opacity-0')}>
                Tick the box above to continue.
              </p>
            </div>
          </motion.div>
        )}
      </dialog>

      {/* Returning visitors: cookie preferences from the footer link */}
      <AnimatePresence>
        {prefs && (
          <motion.section
            role="region"
            aria-label="Cookie preferences"
            className="fixed bottom-4 left-4 right-4 z-[var(--z-overlay)] max-w-[26rem] rounded-md border border-white/10 bg-forest-850/95 p-5 text-sm text-mist shadow-[var(--shadow-lift)] backdrop-blur-xl sm:bottom-6 sm:left-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-display text-base font-semibold tracking-[-0.02em] text-cream">Cookie preferences</p>
            <div className="mt-2 divide-y divide-white/10">
              <Toggle label="Essential" desc="Sign-in, security and your choices" checked locked />
              <Toggle label="Analytics" desc="Understand how the site is used" checked={draft.analytics} onChange={(v) => setDraft((d) => ({ ...d, analytics: v }))} />
              <Toggle label="Advertising" desc="Measure campaigns and relevance" checked={draft.marketing} onChange={(v) => setDraft((d) => ({ ...d, marketing: v }))} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="light" onClick={() => save(draft)}>Save preferences</Button>
              <Button size="sm" variant="quiet" className="text-mist" onClick={() => setPrefs(false)}>Cancel</Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
