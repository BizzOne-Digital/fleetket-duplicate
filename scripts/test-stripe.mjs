// Checks the Stripe setup in .env.local: key mode, account, webhook endpoint + events, and customer portal.
// Usage: npm run test:stripe
import nextEnv from '@next/env'

nextEnv.loadEnvConfig(process.cwd())
const { STRIPE_SECRET_KEY: key = '', STRIPE_WEBHOOK_SECRET: whsec = '' } = process.env
const NEEDED_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted']
let failed = false
const ok = (m) => console.log(`[stripe] ✓ ${m}`)
const bad = (m) => { failed = true; console.error(`[stripe] ✗ ${m}`) }

if (!key) bad('STRIPE_SECRET_KEY is missing')
else if (key.startsWith('sk_live_') || key.startsWith('rk_live_')) ok('secret key is LIVE — real payments')
else if (key.startsWith('sk_test_') || key.startsWith('rk_test_')) bad('secret key is TEST mode — use the sk_live_ key for real payments')
else bad('STRIPE_SECRET_KEY doesn’t look like a Stripe key')
if (!whsec) bad('STRIPE_WEBHOOK_SECRET is missing')
else if (!whsec.startsWith('whsec_')) bad('STRIPE_WEBHOOK_SECRET should start with whsec_')
else ok('webhook signing secret is set')

const api = async (path) => {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${key}` } })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message ?? res.status)
  return json
}

if (key) {
  try {
    const acct = await api('account')
    ok(`connected to ${acct.settings?.dashboard?.display_name || acct.business_profile?.name || acct.id} · charges ${acct.charges_enabled ? 'enabled' : 'NOT enabled'}`)
    if (!acct.charges_enabled) bad('this Stripe account can’t take payments yet — finish activation in the Stripe dashboard')

    const hooks = (await api('webhook_endpoints?limit=100')).data.filter((h) => h.url.endsWith('/api/stripe/webhook'))
    if (!hooks.length) bad('no webhook endpoint ending in /api/stripe/webhook — add https://www.fleeket.com/api/stripe/webhook')
    for (const h of hooks) {
      const missing = h.enabled_events.includes('*') ? [] : NEEDED_EVENTS.filter((e) => !h.enabled_events.includes(e))
      if (h.status !== 'enabled') bad(`webhook ${h.url} is ${h.status}`)
      else if (missing.length) bad(`webhook ${h.url} is missing events: ${missing.join(', ')}`)
      else ok(`webhook ${h.url} has all ${NEEDED_EVENTS.length} events`)
    }

    const portal = (await api('billing_portal/configurations?limit=10')).data.find((c) => c.is_default && c.active)
    if (!portal) bad('customer portal not set up — Stripe → Settings → Billing → Customer portal → Save')
    else if (!portal.features?.subscription_cancel?.enabled) bad('customer portal: turn on “Cancel subscriptions” so members can cancel')
    else ok(`customer portal ready · cancellations ${portal.features.subscription_cancel.mode === 'at_period_end' ? 'take effect at the end of the paid period' : 'are immediate'}`)
  } catch (err) {
    bad(`Stripe API: ${err.message}`)
  }
}
process.exit(failed ? 1 : 0)
