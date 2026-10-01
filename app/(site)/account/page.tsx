import Link from 'next/link'
import { logout } from '@/app/actions/public'
import { Backdrop } from '@/components/site/sections'
import { Button, ButtonLink, TextLink } from '@/components/ui/button'
import { requireUser } from '@/lib/auth'
import { isAdminRole } from '@/lib/constants'
import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Your account')

export default async function AccountPage({ searchParams }: PageProps<'/account'>) {
  const user = await requireUser('/account')
  const { welcome, denied } = await searchParams
  const provider = user.role === 'provider'

  return (
    <section className="grain relative isolate min-h-[100svh] overflow-hidden bg-forest-900 pt-[calc(var(--header-h)+3rem)] pb-24">
      <Backdrop />
      <div className="container-x relative">
        {welcome && <p role="status" className="rise mb-8 inline-block rounded-sm border border-success/40 bg-success/10 px-4 py-2 text-sm text-mist">Your account is ready. Welcome to Fleeket.</p>}
        {denied && <p role="alert" className="rise mb-8 inline-block rounded-sm border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-mist">You don’t have access to the admin area.</p>}
        <p className="rise t-eyebrow text-lime">Your account</p>
        <h1 className="rise t-h1 mt-5 text-cream" style={{ ['--d' as string]: '0.05s' }}>Hello, {user.name.split(' ')[0]}.</h1>
        <p className="rise mt-4 text-fog" style={{ ['--d' as string]: '0.1s' }}>
          Signed in as {user.email} · <span className="capitalize">{user.role}</span> account
        </p>

        <div className="rise mt-14 grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 md:grid-cols-2" style={{ ['--d' as string]: '0.2s' }}>
          <div className="bg-forest-900 p-8 lg:p-10">
            <h2 className="t-h3 text-cream">{provider ? 'Get your service listed' : 'Find a provider'}</h2>
            <p className="mt-3 max-w-sm leading-relaxed text-fog">
              {provider
                ? 'Send us your business details and our team will set up your listing so customers can find you.'
                : 'Browse categories in your area, or tell us what you need and we’ll help connect you.'}
            </p>
            <ButtonLink href={provider ? '/for-providers#list' : '/services'} className="mt-8" arrow>
              {provider ? 'Submit listing details' : 'Explore services'}
            </ButtonLink>
          </div>
          <div className="bg-forest-900 p-8 lg:p-10">
            <h2 className="t-h3 text-cream">Need a hand?</h2>
            <p className="mt-3 max-w-sm leading-relaxed text-fog">Questions about your account, a connection or a payment — our team is a message away.</p>
            <TextLink href="/contact" className="mt-8 text-cream">Contact support</TextLink>
          </div>
        </div>

        <div className="rise mt-10 flex flex-wrap items-center gap-4" style={{ ['--d' as string]: '0.3s' }}>
          {isAdminRole(user.role) && <ButtonLink href="/admin" variant="light" arrow>Open admin dashboard</ButtonLink>}
          <form action={logout}>
            <Button type="submit" variant="outline" className="text-cream">Sign out</Button>
          </form>
          <Link href="/privacy" className="text-sm text-fog hover:text-cream">Privacy &amp; your data</Link>
        </div>
      </div>
    </section>
  )
}
