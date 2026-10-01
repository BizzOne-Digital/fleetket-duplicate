import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, UserCog } from 'lucide-react'
import { formatPlanPrice, getContent, type Category, type Plan } from '@/lib/content'
import { resolveImageSrc } from '@/lib/image'

/** Offer text for the pink banner: the category's own plan if it has one, otherwise the site-wide offer. */
export async function offerFor(plan: Plan | null) {
  const offers = await getContent('offers')
  if (!plan) return offers
  const trial = plan.billing === 'subscription' && plan.trialDays > 0 ? ` · ${plan.trialDays}-day free trial` : ''
  return {
    title: offers.title,
    subtitle: `${plan.name} — ${formatPlanPrice(plan)}${trial}`,
    body: [plan.summary, ...plan.includes.map((i) => `• ${i}`)].filter(Boolean).join('\n'),
  }
}

export function SubServiceCard({ category, sub, count }: { category: Category; sub: Category['subServices'][number]; count: number }) {
  return (
    <Link href={`/services/${category.slug}/${sub.slug}`} className="group relative block aspect-[16/9] overflow-hidden rounded-sm bg-ink">
      <Image src={resolveImageSrc(sub.image || category.image)} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-white">
        <span>
          <span className="block text-[1.5rem] font-bold leading-tight [text-shadow:0_2px_8px_rgb(0_0_0/0.5)] sm:text-[1.6875rem]">{sub.name}</span>
          <span className="mt-1 flex items-center gap-1.5 text-xs">
            <UserCog aria-hidden className="size-5" />
            {count > 0 && <span>{count} {count === 1 ? 'tasker' : 'taskers'}</span>}
          </span>
        </span>
        <ArrowRight aria-hidden className="mb-1 size-6 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
