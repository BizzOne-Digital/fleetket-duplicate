import { ButtonLink } from '@/components/ui/button'
import { MaskedHeading } from '@/components/site/sections'
import { HeroMedia } from '@/components/site/hero-media'
import { NetworkField } from '@/components/site/network-field'
import { ServiceSearch, type SearchCategory } from '@/components/site/service-search'
import { Magnetic } from '@/components/motion'
import type { DefaultContent } from '@/lib/defaults'

type Props = {
  content: DefaultContent['home']
  categories: SearchCategory[]
  areas: { name: string; slug: string }[]
}

const d = (s: number) => ({ ['--d' as string]: `${s}s` })

export function HomeHero({ content, categories, areas }: Props) {
  const labels = categories.map((c) => c.name.split(' ')[0])
  const marquee = categories.map((c) => c.name)

  return (
    <section className="has-splash grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-forest-950">
      <HeroMedia src={content.heroImage} alt={content.heroImageAlt}>
        {/* Live terrain of needs meeting providers, laid over the photograph. */}
        <div className="absolute inset-x-0 bottom-0 top-[30%] opacity-90 mix-blend-screen [mask-image:linear-gradient(90deg,transparent_10%,black_55%)] max-md:[mask-image:none] max-md:opacity-50">
          <NetworkField labels={labels} className="size-full" />
        </div>
      </HeroMedia>

      <div className="container-x relative flex flex-1 flex-col pt-[calc(var(--header-h)+2rem)]">
        <div className="relative flex flex-1 flex-col justify-end pb-10 lg:pb-14">
          <p className="rise t-eyebrow mb-8 flex items-center gap-3 text-lime" style={d(0.1)}>
            <span className="h-px w-10 bg-lime/70" />
            {content.heroEyebrow}
          </p>
          <MaskedHeading text={content.heroHeading} className="t-display max-w-[14ch] text-cream lg:text-[clamp(4.5rem,7.6vw,8.5rem)]" start={0.15} />
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <p className="rise t-lead max-w-[34rem] text-pretty text-fog lg:col-span-5" style={d(0.6)}>
              {content.heroBody}
            </p>
            <div className="rise flex flex-wrap items-center gap-3 lg:col-span-7 lg:justify-end" style={d(0.75)}>
              <Magnetic className="max-sm:w-full">
                <ButtonLink href="/services" size="lg" className="max-sm:w-full" arrow>{content.primaryCta}</ButtonLink>
              </Magnetic>
              <ButtonLink href="/for-providers" size="lg" variant="outline" className="text-cream max-sm:w-full">{content.secondaryCta}</ButtonLink>
            </div>
          </div>
        </div>

        <div className="rise relative z-20 pb-10" style={d(0.95)}>
          <ServiceSearch categories={categories} areas={areas} />
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fog">
            <span className="text-cream/50">Popular:</span>
            {categories.filter((c) => c.featured).slice(0, 6).map((c) => (
              <a key={c.slug} href={`/services/${c.slug}`} className="underline decoration-cream/25 underline-offset-4 transition-colors hover:text-cream hover:decoration-lime">
                {c.name}
              </a>
            ))}
          </p>
        </div>
      </div>

      {/* Category ticker */}
      <div className="rise relative border-t border-cream/10 bg-forest-950/70 py-5 backdrop-blur-md" style={d(1.1)}>
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap pr-10 motion-reduce:animate-none" aria-hidden>
          {[...marquee, ...marquee].map((name, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-xl font-medium tracking-[-0.02em] text-cream/70">
              {name}
              <svg viewBox="0 0 14 10" className="h-2.5 w-3.5 text-lime" fill="currentColor"><path d="M3 0h8l3 5-3 5H3L0 5z" /></svg>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
