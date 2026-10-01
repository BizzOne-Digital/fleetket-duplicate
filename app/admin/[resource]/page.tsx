import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/ui'
import { ResourceTable } from '@/components/admin/resource-table'
import { ButtonLink } from '@/components/ui/button'
import { db } from '@/lib/content'
import { RESOURCE_MODELS } from '@/lib/resource-models'
import { RESOURCE_DEFS, isResourceKey } from '@/lib/resources'

export async function generateMetadata({ params }: PageProps<'/admin/[resource]'>) {
  const { resource } = await params
  return { title: isResourceKey(resource) ? RESOURCE_DEFS[resource].title : 'Not found' }
}

export default async function ResourceListPage({ params }: PageProps<'/admin/[resource]'>) {
  const { resource } = await params
  if (!isResourceKey(resource)) notFound()
  const def = RESOURCE_DEFS[resource]
  await db()
  const docs = (await RESOURCE_MODELS[resource].find().sort({ order: 1, _id: 1 }).lean()) as Record<string, unknown>[]

  const rows = docs.map((d) => ({
    id: String(d._id),
    published: d.published !== false,
    cells: def.columns.map((c) => String(d[c.key] ?? '')),
    search: def.searchKeys.map((k) => String(d[k] ?? '')).join(' ').toLowerCase(),
  }))

  return (
    <div className="grid gap-8">
      <AdminHeader
        title={def.title}
        description={`${docs.length} total · ordered as they appear on the site. Use the arrows to reorder.`}
        actions={
          <>
            <ButtonLink href={def.publicPath} target="_blank" variant="outline" size="sm">View on site ↗</ButtonLink>
            <ButtonLink href={`/admin/${resource}/new`} variant="dark" size="sm">New {def.singular.toLowerCase()}</ButtonLink>
          </>
        }
      />
      <ResourceTable resource={resource} columns={def.columns.map((c) => c.label)} rows={rows} singular={def.singular} />
    </div>
  )
}
