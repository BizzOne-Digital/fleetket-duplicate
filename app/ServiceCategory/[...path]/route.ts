import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/content'

/**
 * Keeps links from the previous fleeket.com working:
 *   /ServiceCategory/32     → /services/automotive
 *   /ServiceCategory/32/41  → /services/automotive/car-detailing
 * Unknown IDs fall back to the services list.
 */
export async function GET(req: Request, ctx: RouteContext<'/ServiceCategory/[...path]'>) {
  const [catId, subId] = (await ctx.params).path.map(Number)
  const category = (await getCategories()).find((c) => c.legacyId === catId)
  const sub = category?.subServices.find((s) => s.legacyId === subId)
  const target = category ? `/services/${category.slug}${sub ? `/${sub.slug}` : ''}` : '/#services'
  return NextResponse.redirect(new URL(target, req.url), 308)
}
