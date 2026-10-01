import { PageHero, CtaBand, Eyebrow, NumberedList } from '@/components/site/sections'
import { ProcessStory } from '@/components/site/process-story'
import { Reveal } from '@/components/motion'
import { ButtonLink } from '@/components/ui/button'
import { formatPrice, getContent } from '@/lib/content'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('howItWorks', '/how-it-works')

export default async function HowItWorksPage() {
  const [page, providers, pricing, home] = await Promise.all([getContent('howItWorks'), getContent('providers'), getContent('pricing'), getContent('home')])

  return (
    <>
      <PageHero eyebrow={page.eyebrow} heading={page.heading} body={page.body} crumbs={[{ label: 'How it works', href: '/how-it-works' }]} image={page.heroImage}>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/register" size="lg" arrow>Create an account</ButtonLink>
          <ButtonLink href="/services" size="lg" variant="outline" className="text-cream">Explore services</ButtonLink>
        </div>
      </PageHero>

      <section className="relative bg-forest-900 pb-12 lg:pb-24">
        <div className="container-x">
          <ProcessStory stages={page.stages} price={formatPrice(pricing)} />
        </div>
      </section>

      <section className="surface-light bg-cream py-24 text-forest-900 lg:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Eyebrow tone="light">For service providers</Eyebrow>
            <h2 className="t-h2 mt-6">And if you’re the one doing the work…</h2>
            <p className="mt-5 max-w-sm leading-relaxed text-slate">{providers.body}</p>
            <ButtonLink href="/for-providers" variant="dark" className="mt-8" arrow>Advertise your service</ButtonLink>
          </Reveal>
          <div className="lg:col-span-7 lg:col-start-6">
            <NumberedList items={providers.steps} tone="light" columns={2} />
          </div>
        </div>
      </section>

      <CtaBand title={home.finalTitle} body={home.finalBody} />
    </>
  )
}
