import { LegalPage } from '@/components/live/legal'
import { getContent } from '@/lib/content'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('privacy', '/privacy')

export default async function Page() {
  return <LegalPage content={await getContent('privacy')} />
}
