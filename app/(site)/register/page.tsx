import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/site/auth-shell'
import { RegisterForm } from '@/components/forms/auth-forms'
import { getCurrentUser } from '@/lib/auth'
import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Create an account')

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect('/account')
  return (
    <AuthShell title="Create your account." body="Free to join. Find the help you need — or put your service in front of the people looking for it.">
      <RegisterForm />
    </AuthShell>
  )
}
