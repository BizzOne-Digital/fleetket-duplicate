import { redirect } from 'next/navigation'
import { ContentIndex } from '@/components/admin/content-index'
import { requireAdmin } from '@/lib/auth'
import { canManageUsers } from '@/lib/constants'

export const metadata = { title: 'Settings' }

export default async function AdminSettingsIndex() {
  const user = await requireAdmin()
  if (!canManageUsers(user.role)) redirect('/admin')
  return <ContentIndex section="Settings" title="Site & SEO settings" description="Contact details, social links, footer copy and the defaults used for search and social sharing." />
}
