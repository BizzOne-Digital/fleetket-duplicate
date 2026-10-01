/**
 * Launch splash — a short layered sequence, driven entirely by CSS (see “Splash” in globals.css):
 * mark draws → wordmark rises letter by letter → lime wipe → two-layer curtain lifts off the hero.
 * It always animates itself out, so a JavaScript failure can never hide the page.
 * Skipped after the first view in a session and for reduced-motion users.
 */
export function Splash() {
  return (
    <>
      <div className="splash-trail" aria-hidden />
      <div className="splash" aria-hidden>
        <div className="flex w-full flex-col items-center px-6">
          <svg viewBox="0 0 40 28" className="splash-mark mb-[4vh] h-10 w-14 text-cream sm:h-12 sm:w-[4.25rem]" fill="none">
            <path pathLength={1} d="M9 1.5h22l7.5 12.5L31 26.5H9L1.5 14 9 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path pathLength={1} d="M12.5 14h15" stroke="#d9f25a" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <div className="splash-word flex overflow-hidden font-display text-[clamp(4.5rem,17vw,16rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-cream">
            {'Fleeket'.split('').map((ch, i) => (
              <span key={i} style={{ animationDelay: `${0.2 + i * 0.055}s` }}>{ch}</span>
            ))}
          </div>
          <div className="mt-[5vh] flex w-full max-w-md items-center gap-4">
            <span className="splash-tag text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-fog">Connecting needs</span>
            <span className="h-px flex-1 overflow-hidden bg-white/10">
              <span className="splash-line block h-px w-full bg-lime" />
            </span>
            <span className="splash-tag text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-fog">with expert deeds</span>
          </div>
        </div>
        <div className="splash-wipe" />
      </div>
    </>
  )
}
