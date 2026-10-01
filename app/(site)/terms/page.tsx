import { LegalPage } from '@/components/site/legal-page'
import { getContent } from '@/lib/content'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('terms', '/terms')

export default async function TermsPage() {
  return <LegalPage content={await getContent('terms')} path="/terms" />
}
