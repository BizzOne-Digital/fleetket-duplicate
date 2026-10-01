import Link from 'next/link'
import { PageHero } from '@/components/site/sections'
import { ContactForm } from '@/components/forms/lead-forms'
import { Reveal } from '@/components/motion'
import { TextLink } from '@/components/ui/button'
import { getCategories, getContent } from '@/lib/content'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('contactPage', '/contact')

export default async function ContactPage() {
  const [page, site, categories] = await Promise.all([getContent('contactPage'), getContent('site'), getCategories()])

  return (
    <>
      <PageHero eyebrow={page.eyebrow} heading={page.heading} body={page.body} crumbs={[{ label: 'Contact', href: '/contact' }]} image={page.heroImage} />

      <section className="surface-light bg-cream py-20 text-forest-900 lg:py-28">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <Reveal>
              <p className="t-eyebrow text-slate">Email</p>
              <a href={`mailto:${site.contactEmail}`} className="mt-3 block break-words font-display text-2xl font-semibold tracking-[-0.03em] underline decoration-forest-900/20 underline-offset-[6px] hover:decoration-moss">
                {site.contactEmail}
              </a>
              {site.phone && (
                <>
                  <p className="t-eyebrow mt-10 text-slate">Phone</p>
                  <p className="mt-3 text-lg">{site.phone}</p>
                </>
              )}
            </Reveal>
            <Reveal delay={0.1} className="mt-12 space-y-6 border-t border-forest-900/15 pt-10">
              <div>
                <p className="font-medium">Looking for a provider?</p>
                <p className="mt-1 text-slate">The fastest route is our services directory.</p>
                <TextLink href="/services" className="mt-3 text-forest-900">Explore services</TextLink>
              </div>
              <div>
                <p className="font-medium">Want to advertise?</p>
                <p className="mt-1 text-slate">Send your details through the provider listing form.</p>
                <TextLink href="/for-providers#list" className="mt-3 text-forest-900">List your service</TextLink>
              </div>
              <p className="text-sm text-slate">
                Many answers are already in our <Link href="/faq" className="underline underline-offset-2">FAQ</Link>.
              </p>
            </Reveal>
          </aside>
          <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.05}>
            <div className="rounded-md border border-forest-900/10 bg-paper p-6 shadow-[var(--shadow-card)] sm:p-10">
              <ContactForm categories={categories.map((c) => c.name)} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
