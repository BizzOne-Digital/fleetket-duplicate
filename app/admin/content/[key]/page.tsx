import { notFound, redirect } from 'next/navigation'
import { saveContent } from '@/app/actions/admin'
import { AdminHeader, Panel } from '@/components/admin/ui'
import { ContentForm } from '@/components/admin/content-form'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/content'
import { Content } from '@/lib/models'
import { CONTENT_DEFS, isContentKey } from '@/lib/content-schema'
import { DEFAULT_CONTENT } from '@/lib/defaults'
import { withDefaults } from '@/lib/fields'
import { canManageUsers } from '@/lib/constants'

const SECTION_HREF = { Pages: '/admin/pages', Pricing: '/admin/content/pricing', Legal: '/admin/legal', Settings: '/admin/settings' } as const

export async function generateMetadata({ params }: PageProps<'/admin/content/[key]'>) {
  const { key } = await params
  return { title: isContentKey(key) ? CONTENT_DEFS[key].title : 'Not found' }
}

export default async function ContentEditPage({ params }: PageProps<'/admin/content/[key]'>) {
  const { key } = await params
  if (!isContentKey(key)) notFound()
  const def = CONTENT_DEFS[key]
  const user = await requireAdmin()
  if (def.section === 'Settings' && !canManageUsers(user.role)) redirect('/admin?denied=settings')

  await db()
  const doc = await Content.findOne({ key }).lean()
  const initial = withDefaults(def.fields, JSON.parse(JSON.stringify({ ...DEFAULT_CONTENT[key], ...((doc?.value as object) ?? {}) })))

  return (
    <div className="grid gap-8">
      <AdminHeader
        title={def.title}
        description={doc?.updatedAt ? `Last saved ${new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short' }).format(doc.updatedAt)}` : 'Using the original launch copy — edit and save to make it yours.'}
        crumbs={key === 'pricing' ? undefined : [{ label: def.section, href: SECTION_HREF[def.section] }, { label: def.title, href: `/admin/content/${key}` }]}
      />
      <Panel className="px-5 pt-6 md:px-8">
        <ContentForm fields={def.fields} initial={initial} action={saveContent.bind(null, key)} folder="pages" previewHref={def.path} />
      </Panel>
    </div>
  )
}
