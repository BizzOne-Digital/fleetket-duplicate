import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/site/auth-shell'
import { LoginForm } from '@/components/forms/auth-forms'
import { getCurrentUser } from '@/lib/auth'
import { isAdminRole } from '@/lib/constants'
import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Sign in')

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next } = await searchParams
  const user = await getCurrentUser()
  if (user) redirect(isAdminRole(user.role) ? '/admin' : '/account')
  return (
    <AuthShell title="Welcome back." body="Sign in to manage your account, your requests and your listings.">
      <LoginForm next={typeof next === 'string' ? next : undefined} />
    </AuthShell>
  )
}
