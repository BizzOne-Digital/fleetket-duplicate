import Link from 'next/link'
import { AdminHeader, Panel } from '@/components/admin/ui'
import { db } from '@/lib/content'
import { Content } from '@/lib/models'
import { CONTENT_DEFS, CONTENT_KEYS, type ContentDef } from '@/lib/content-schema'

export async function ContentIndex({ title, description, section }: { title: string; description: string; section: ContentDef['section'] }) {
  const keys = CONTENT_KEYS.filter((k) => CONTENT_DEFS[k].section === section)
  await db()
  const docs = await Content.find({ key: { $in: keys } }).select('key updatedAt').lean()

  return (
    <div className="grid gap-8">
      <AdminHeader title={title} description={description} />
      <Panel>
        <ul className="divide-y divide-forest-900/10">
          {keys.map((k) => {
            const def = CONTENT_DEFS[k]
            const updated = docs.find((d) => d.key === k)?.updatedAt
            return (
              <li key={k}>
                <Link href={`/admin/content/${k}`} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-paper">
                  <div>
                    <p className="font-medium text-forest-900">{def.title}</p>
                    <p className="text-sm text-pebble">{def.section === 'Settings' ? 'Site-wide' : def.path} · {def.fields.length} fields</p>
                  </div>
                  <span className="text-sm text-slate">
                    {updated ? `Edited ${new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium' }).format(updated)}` : 'Launch copy'}
                    <span aria-hidden className="ml-3 text-moss">→</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Panel>
    </div>
  )
}
