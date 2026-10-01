import Image from 'next/image'
import { resolveImageSrc } from '@/lib/image'

/** Half form / half photo layout of the live sign-up pages. The photo fades into brand red at the bottom. */
export function SignupShell({ heading, body, image, imageAlt, imageSide, children }: { heading: string; body: string; image: string; imageAlt: string; imageSide: 'left' | 'right'; children: React.ReactNode }) {
  const photo = (
    <div className="relative hidden min-h-full lg:block">
      <Image src={resolveImageSrc(image)} alt={imageAlt} fill priority sizes="50vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/25 to-brand" />
    </div>
  )
  return (
    <div className="grid lg:grid-cols-2">
      {imageSide === 'left' && photo}
      <section className="px-[var(--gutter)] py-8 lg:px-24">
        <h1 className="text-[1.75rem] font-bold text-ink sm:text-[2rem]">{heading}</h1>
        <p className="mb-6 mt-2 max-w-xl text-[0.8125rem] leading-relaxed">{body}</p>
        <div className="max-w-xl">{children}</div>
      </section>
      {imageSide === 'right' && photo}
    </div>
  )
}
