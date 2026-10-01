import { HeroMedia } from '@/components/site/hero-media'

const AUTH_IMAGE = 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&q=80&w=2000'

export function AuthShell({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <section className="grain relative isolate min-h-[100svh] overflow-hidden bg-forest-900 pt-[calc(var(--header-h)+3rem)] pb-24">
      <HeroMedia src={AUTH_IMAGE} />
      <div className="container-x relative grid gap-14 lg:grid-cols-12 lg:items-center lg:pt-10">
        <div className="lg:col-span-5">
          <h1 className="rise t-h1 max-w-[12ch] text-cream">{title}</h1>
          <p className="rise t-lead mt-6 max-w-md text-fog" style={{ ['--d' as string]: '0.15s' }}>{body}</p>
        </div>
        <div className="rise lg:col-span-5 lg:col-start-8" style={{ ['--d' as string]: '0.25s' }}>
          <div className="rounded-md border border-white/10 bg-forest-850/80 p-6 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:p-9">{children}</div>
        </div>
      </div>
    </section>
  )
}
