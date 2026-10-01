import { notFound } from 'next/navigation'
import { isValidObjectId } from 'mongoose'
import { saveResource, deleteResources } from '@/app/actions/admin'
import { AdminHeader, Panel } from '@/components/admin/ui'
import { ContentForm } from '@/components/admin/content-form'
import { DeleteResourceButton } from '@/components/admin/delete-resource'
import { db } from '@/lib/content'
import { RESOURCE_MODELS } from '@/lib/resource-models'
import { withDefaults } from '@/lib/fields'
import { RESOURCE_DEFS, isResourceKey } from '@/lib/resources'

export const metadata = { title: 'Edit' }

export default async function ResourceEditPage({ params }: PageProps<'/admin/[resource]/[id]'>) {
  const { resource, id } = await params
  if (!isResourceKey(resource)) notFound()
  const def = RESOURCE_DEFS[resource]
  const isNew = id === 'new'

  let initial: Record<string, unknown> = withDefaults(def.fields, { published: true })
  if (!isNew) {
    if (!isValidObjectId(id)) notFound()
    await db()
    const doc = await RESOURCE_MODELS[resource].findById(id).lean()
    if (!doc) notFound()
    // Serialise to plain JSON for the client form (drops ObjectIds/Dates).
    initial = withDefaults(def.fields, JSON.parse(JSON.stringify(doc)))
  }

  const name = String(initial.name ?? initial.question ?? '')
  const previewHref = !isNew && def.hasSlug ? `${def.publicPath}/${initial.slug}` : !isNew ? def.publicPath : undefined

  return (
    <div className="grid gap-8">
      <AdminHeader
        title={isNew ? `New ${def.singular.toLowerCase()}` : name || def.singular}
        crumbs={[{ label: def.title, href: `/admin/${resource}` }, { label: isNew ? 'New' : 'Edit', href: `/admin/${resource}/${id}` }]}
        actions={!isNew && <DeleteResourceButton resource={resource} id={id} singular={def.singular} action={deleteResources} />}
      />
      <Panel className="px-5 pt-6 md:px-8">
        <ContentForm
          fields={def.fields}
          initial={initial}
          action={saveResource.bind(null, resource, isNew ? null : id)}
          folder="gallery"
          submitLabel={isNew ? `Create ${def.singular.toLowerCase()}` : 'Save changes'}
          redirectTo={isNew ? `/admin/${resource}/{id}` : undefined}
          previewHref={previewHref}
        />
      </Panel>
    </div>
  )
}
