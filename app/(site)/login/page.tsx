import { redirect } from 'next/navigation'
import { Logo } from '@/components/live/logo'
import { LoginForm } from '@/components/forms/live-forms'
import { getCurrentUser } from '@/lib/auth'
import { isAdminRole } from '@/lib/constants'
import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Sign In')

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next } = await searchParams
  const user = await getCurrentUser()
  if (user) redirect(isAdminRole(user.role) ? '/admin' : '/account')
  return (
    <section className="grid min-h-[calc(100svh-var(--header-h)-260px)] place-items-center px-[var(--gutter)] py-16">
      <div className="w-full max-w-[26rem] rounded-md border border-[#dee2e6] bg-white p-4 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex justify-center">
          <Logo className="h-12" />
        </div>
        <h1 className="sr-only">Sign in to Fleeket</h1>
        <LoginForm next={typeof next === 'string' ? next : undefined} />
      </div>
    </section>
  )
}
