import { SignupShell } from '@/components/live/signup-shell'
import { TaskerForm } from '@/components/forms/live-forms'
import { getCategories, getContent } from '@/lib/content'
import { generatePageMetadata } from '@/lib/seo'

export const generateMetadata = () => generatePageMetadata('taskerPage', '/become-a-tasker')

export default async function BecomeTaskerPage() {
  const [page, categories] = await Promise.all([getContent('taskerPage'), getCategories()])
  const groups = categories
    .filter((c) => c.subServices.length)
    .map((c) => ({ slug: c.slug, name: c.name, subServices: c.subServices.map((s) => ({ slug: s.slug, name: s.name })) }))

  return (
    <SignupShell heading={page.heading} body={page.body} image={page.image} imageAlt="Become a tasker — service provider registration" imageSide="right">
      <TaskerForm groups={groups} copy={{ skillsTitle: page.skillsTitle, skillsBody: page.skillsBody, hoursTitle: page.hoursTitle, hoursBody: page.hoursBody }} />
    </SignupShell>
  )
}
