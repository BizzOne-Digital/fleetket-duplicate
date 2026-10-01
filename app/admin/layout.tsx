import { AdminSidebar } from '@/components/admin/sidebar'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/content'
import { isDbConfigured } from '@/lib/db'
import { Lead } from '@/lib/models'
import { canManageUsers } from '@/lib/constants'
import { noIndexMetadata } from '@/lib/seo'

export const metadata = { ...noIndexMetadata(), title: { default: 'Admin', template: '%s · Fleeket Admin' } }
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isDbConfigured) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper p-6 text-forest-900">
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-semibold">Database not configured</h1>
          <p className="mt-3 text-slate">Set <code className="rounded bg-sage px-1.5 py-0.5 text-sm">MONGODB_URI</code> and <code className="rounded bg-sage px-1.5 py-0.5 text-sm">SESSION_SECRET</code> in your environment to use the admin dashboard. See README.md.</p>
        </div>
      </main>
    )
  }

  const user = await requireAdmin()
  await db()
  const newLeads = await Lead.countDocuments({ status: 'new' })

  return (
    <div className="surface-light min-h-screen bg-paper text-forest-900 lg:flex">
      <AdminSidebar user={user} newLeads={newLeads} canManage={canManageUsers(user.role)} />
      <main id="main" className="min-w-0 flex-1 px-5 py-8 md:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
