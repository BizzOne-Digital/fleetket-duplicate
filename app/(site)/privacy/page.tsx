import { LegalPage } from '@/components/site/legal-page'
import { getContent } from '@/lib/content'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('privacy', '/privacy')

export default async function PrivacyPage() {
  return <LegalPage content={await getContent('privacy')} path="/privacy" />
}
