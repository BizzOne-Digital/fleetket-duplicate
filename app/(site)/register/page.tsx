import { SignupShell } from '@/components/live/signup-shell'
import { MemberForm } from '@/components/forms/live-forms'
import { getContent } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getContent('memberPage')
  return buildMetadata({ title: page.seoTitle || 'Be Our Member', description: page.seoDescription, path: '/register', absoluteTitle: true })
}

export default async function RegisterPage() {
  const page = await getContent('memberPage')
  return (
    <SignupShell heading={page.heading} body={page.body} image={page.image} imageAlt="Smiling customer browsing taskers on a phone" imageSide="left">
      <MemberForm />
    </SignupShell>
  )
}
