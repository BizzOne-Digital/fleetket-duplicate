import { AtSign } from 'lucide-react'
import { ContactForm } from '@/components/forms/live-forms'
import { FaqSection } from '@/components/live/faq'
import { getContent, getFaqs } from '@/lib/content'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('contactPage', '/contact')

export default async function ContactPage() {
  const [page, home, site, faqs] = await Promise.all([getContent('contactPage'), getContent('home'), getContent('site'), getFaqs()])
  return (
    <>
      <section className="py-8">
        <div className="container-x grid gap-8 lg:grid-cols-[1.65fr_1fr]">
          <div>
            <h1 className="text-[1.75rem] font-bold text-ink sm:text-[2rem]">{page.heading}</h1>
            <p className="mt-4 text-[0.8125rem] leading-relaxed">{page.body}</p>
            <a href={`mailto:${site.contactEmail}`} className="mt-4 inline-flex items-center gap-3 text-[0.8125rem] font-bold text-ink hover:text-brand">
              <span className="grid size-10 place-items-center rounded-full bg-brand text-white"><AtSign aria-hidden className="size-5" /></span>
              {site.contactEmail}
            </a>
          </div>
          <div className="rounded bg-panel p-4 shadow-[var(--shadow-card)]">
            <h2 className="text-[1.375rem] font-bold leading-snug text-ink sm:text-[1.625rem]">{page.formTitle}</h2>
            <p className="mb-4 mt-3 text-[1.125rem]">{page.formSubtitle}</p>
            <ContactForm />
          </div>
        </div>
      </section>
      <FaqSection heading={home.faqHeading} bannerImage={home.faqBannerImage} bannerTitle={home.faqBannerTitle} bannerBody={home.faqBannerBody} items={faqs.map((f) => ({ q: f.question, a: f.answer }))} />
    </>
  )
}
