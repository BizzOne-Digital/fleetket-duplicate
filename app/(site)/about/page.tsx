import Image from 'next/image'
import { getContent } from '@/lib/content'
import { resolveImageSrc } from '@/lib/image'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('about', '/about')

function Photo({ src, alt = '', className }: { src: string; alt?: string; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-sm shadow-[var(--shadow-card)] ${className}`}>
      <Image src={resolveImageSrc(src)} alt={alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
    </div>
  )
}

export default async function AboutPage() {
  const page = await getContent('about')
  return (
    <>
      <section className="py-8">
        <div className="container-x text-center">
          <h1 className="text-[1.75rem] font-bold text-ink sm:text-[2rem]">{page.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[1.375rem] font-bold leading-snug text-brand sm:text-[1.625rem]">{page.subtitle}</p>
          <p className="mx-auto mt-2 max-w-3xl text-[1.0625rem] leading-relaxed text-body sm:text-[1.25rem]">{page.intro}</p>
          <div className="relative mt-5 aspect-[21/8] overflow-hidden rounded-sm shadow-[var(--shadow-card)]">
            <Image src={resolveImageSrc(page.image)} alt="Toronto, Canada skyline" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-band py-8">
        <div className="container-x grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-[1.75rem] font-bold text-ink">{page.missionTitle}</h2>
            <p className="mt-2 text-[1.0625rem] leading-relaxed sm:text-[1.25rem]">{page.missionBody}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-3 pt-6">
              <Photo src={page.missionImage1} className="aspect-[3/4]" />
              <Photo src={page.missionImage2} className="aspect-[4/3]" />
            </div>
            <div className="grid gap-3">
              <Photo src={page.missionImage3} className="aspect-[4/3]" />
              <Photo src={page.missionImage4} className="aspect-[4/5]" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-x relative pb-4 md:pb-0">
          <div className="relative aspect-[16/8] overflow-hidden rounded-sm shadow-[var(--shadow-card)] md:w-[60%]">
            <Image src={resolveImageSrc(page.networkImage)} alt="Service provider helping a client" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
          </div>
          <div className="relative -mt-10 ml-auto w-[92%] rounded-sm bg-white p-5 shadow-[var(--shadow-card)] md:absolute md:bottom-0 md:right-[var(--gutter)] md:mt-0 md:w-[60%] md:translate-y-1/4">
            <h2 className="text-[1.75rem] font-bold text-ink">{page.networkTitle}</h2>
            <p className="mt-2 text-[1.0625rem] leading-relaxed sm:text-[1.25rem]">{page.networkBody}</p>
          </div>
        </div>
        <div className="hidden h-24 md:block" />
      </section>
    </>
  )
}
