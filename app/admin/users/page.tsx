import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin/ui'
import { UsersManager } from '@/components/admin/users-manager'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/content'
import { User } from '@/lib/models'
import { canManageUsers } from '@/lib/constants'

export const metadata = { title: 'Users' }

export default async function UsersPage() {
  const me = await requireAdmin()
  if (!canManageUsers(me.role)) redirect('/admin')
  await db()
  const users = await User.find().sort({ createdAt: -1 }).limit(500).lean()

  return (
    <div className="grid gap-8">
      <AdminHeader title="Users" description="Administrators, editors and the customer and provider accounts created on the site. Editors can manage content but not users or settings." />
      <UsersManager
        meId={me.id}
        meRole={me.role}
        users={users.map((u) => ({
          id: String(u._id),
          name: u.name,
          email: u.email,
          role: u.role,
          active: u.active,
          createdAt: u.createdAt.toISOString(),
          lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        }))}
      />
    </div>
  )
}
