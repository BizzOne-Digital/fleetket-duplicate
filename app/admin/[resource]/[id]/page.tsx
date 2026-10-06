import { notFound } from 'next/navigation'
import { isValidObjectId } from 'mongoose'
import { saveResource, deleteResources } from '@/app/actions/admin'
import Link from 'next/link'
import { AdminHeader, Badge, Panel } from '@/components/admin/ui'
import { ContentForm } from '@/components/admin/content-form'
import { DeleteResourceButton } from '@/components/admin/delete-resource'
import { db, getPlan } from '@/lib/content'
import { RESOURCE_MODELS, withReferenceOptions } from '@/lib/resource-models'
import { withDefaults } from '@/lib/fields'
import { RESOURCE_DEFS, isResourceKey } from '@/lib/resources'

export const metadata = { title: 'Edit' }

export default async function ResourceEditPage({ params }: PageProps<'/admin/[resource]/[id]'>) {
  const { resource, id } = await params
  if (!isResourceKey(resource)) notFound()
  const def = RESOURCE_DEFS[resource]
  const isNew = id === 'new'

  let initial: Record<string, unknown> = withDefaults(def.fields, { published: true })
  let doc: Record<string, unknown> | null = null
  await db()
  if (!isNew) {
    if (!isValidObjectId(id)) notFound()
    doc = await RESOURCE_MODELS[resource].findById(id).lean<Record<string, unknown>>()
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
      {resource === 'subscribers' && doc && <MembershipPanel s={doc} planName={(await getPlan(String(doc.membershipPlan ?? '')))?.name} />}
      <Panel className="px-5 pt-6 md:px-8">
        <ContentForm
          fields={await withReferenceOptions(def.fields)}
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

const MEMBERSHIP_LABELS: Record<string, string> = {
  active: 'Active — paying',
  trialing: 'Free period',
  past_due: 'Payment failed — Stripe is retrying',
  unpaid: 'Unpaid — retries exhausted',
  paused: 'Paused',
  canceled: 'Cancelled',
  incomplete: 'Checkout not finished',
  incomplete_expired: 'Checkout expired',
}

/** Read-only: kept in step with Stripe by the webhook (lib/membership.ts), so it isn't part of the editable form. */
function MembershipPanel({ s, planName }: { s: Record<string, unknown>; planName?: string }) {
  const str = (k: string) => String(s[k] ?? '')
  const status = str('membershipStatus')
  const rows: [string, React.ReactNode][] = [
    ['Status', status ? <Badge status={['active', 'trialing'].includes(status) ? 'active' : ['past_due', 'unpaid'].includes(status) ? 'disabled' : status === 'canceled' ? 'closed' : 'contacted'}>{MEMBERSHIP_LABELS[status] ?? status}</Badge> : 'No membership yet — the tasker subscribes from their account page'],
  ]
  if (str('membershipPlan')) rows.push(['Plan', <Link key="p" href="/admin/plans" className="text-moss hover:underline">{planName ?? str('membershipPlan')}</Link>])
  if (str('renewsOn')) rows.push([s.cancelAtPeriodEnd ? 'Ends on' : status === 'trialing' ? 'First payment' : 'Renews on', str('renewsOn')])
  if (str('promoCode')) rows.push(['Promo code', `${str('promoCode')}${str('freeUntil') ? ` — free until ${str('freeUntil')}` : ''}`])
  if (str('stripeCustomerId'))
    rows.push([
      'Stripe',
      <span key="s" className="flex flex-wrap gap-x-4">
        <a href={`https://dashboard.stripe.com/customers/${str('stripeCustomerId')}`} target="_blank" rel="noreferrer" className="text-moss hover:underline">Customer ↗</a>
        {str('stripeSubscriptionId') && <a href={`https://dashboard.stripe.com/subscriptions/${str('stripeSubscriptionId')}`} target="_blank" rel="noreferrer" className="text-moss hover:underline">Subscription ↗</a>}
      </span>,
    ])
  return (
    <Panel title="Membership">
      <dl className="grid gap-x-6 gap-y-3 px-5 py-4 text-sm sm:grid-cols-[10rem_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-slate">{k}</dt>
            <dd className="text-forest-900">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-forest-900/10 px-5 py-3 text-xs text-pebble">Updated automatically from Stripe. Refunds, card changes and cancellations are done in Stripe or by the tasker from their account page.</p>
    </Panel>
  )
}
