'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { isValidObjectId } from 'mongoose'
import { db, getCategories, getCategory, getPlan, getPlans } from '@/lib/content'
import { isDbConfigured } from '@/lib/db'
import { Lead, Listing, Subscriber, User } from '@/lib/models'
import { contactSchema, flattenErrors, listingSchema, loginSchema, serviceRequestSchema, taskerSchema, type FormState } from '@/lib/schemas'
import { createSession, destroySession, getCurrentUser, hashPassword, requireUser, verifyPassword } from '@/lib/auth'
import { adminListingUrl, notifyAdmin } from '@/lib/listing-service'
import { formatMoney, maxListingDays, quoteListing, todayISO } from '@/lib/listings'
import { rateLimited } from '@/lib/rate-limit'
import { createCheckoutSession, isStripeConfigured, priceWithPromotionCode } from '@/lib/stripe'
import { storeImage } from '@/lib/uploads'
import { geocode } from '@/lib/geocode'
import { claimPromoCode, promoCodeProblem, releasePromoCode } from '@/lib/membership'
import { startMembership } from '@/app/actions/membership'
import { isAdminRole, LEAD_TYPE_LABELS, WEEKDAYS, type LeadType, type Role } from '@/lib/constants'

const NOT_CONFIGURED: FormState = {
  ok: false,
  message: 'Our forms are temporarily unavailable. Please email fleeket@outlook.com and we’ll respond directly.',
}
const TOO_MANY: FormState = { ok: false, message: 'Too many attempts. Please wait a few minutes and try again.' }
const CHECK_FIELDS = 'Please check the highlighted fields.'

const fd = (form: FormData) => {
  const o = Object.fromEntries(form.entries()) as Record<string, unknown>
  o.terms = form.get('terms') === 'on'
  o.website ??= ''
  return o
}

const notify = (type: LeadType, fields: Record<string, string>) =>
  notifyAdmin(`New ${LEAD_TYPE_LABELS[type].toLowerCase()} — ${fields.Name}`, fields, fields.Email)

export async function submitContact(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(fd(form))
  if (!parsed.success) return { ok: false, message: CHECK_FIELDS, errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('contact', 5, 10 * 60_000)) return TOO_MANY

  const { website: _hp, ...data } = parsed.data
  try {
    await db()
    await Lead.create({ ...data, type: 'contact' })
  } catch (err) {
    console.error('[contact] save failed', err)
    return { ok: false, message: 'We couldn’t send your message just now. Please try again in a moment.' }
  }
  await notify('contact', { Name: data.name, Email: data.email, Phone: data.phone, Subject: data.subject, Message: data.message, Page: data.sourcePage })
  return { ok: true, message: 'Thank you — your message has been received. We’ll get back to you asap.' }
}

export async function submitServiceRequest(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = serviceRequestSchema.safeParse({ ...fd(form), providers: form.getAll('providers') })
  if (!parsed.success) return { ok: false, message: CHECK_FIELDS, errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('request', 5, 10 * 60_000)) return TOO_MANY

  const { website: _hp, providers, subService, ...data } = parsed.data
  const category = (await getCategories()).find((c) => c.slug === data.category)
  if (!category) return { ok: false, message: 'That service is no longer available.' }
  const sub = category.subServices.find((s) => s.slug === subService)
  const label = sub ? `${category.name} — ${sub.name}` : category.name
  let taskers = ''
  try {
    await db()
    const ids = providers.filter((id) => isValidObjectId(id))
    const chosen = ids.length
      ? await Subscriber.find({ _id: { $in: ids }, category: category.slug }).select('name contactName phone email address city region postalCode country').lean()
      : []
    // The requested taskers' contact details, for the admin email and the lead — what the team passes on to the customer.
    taskers = chosen
      .map((t, i) =>
        [
          `${i + 1}. ${t.name}${t.contactName && t.contactName !== t.name ? ` (contact: ${t.contactName})` : ''}`,
          `   Phone: ${t.phone || 'not provided'}`,
          `   Email: ${t.email || 'not provided'}`,
          `   Address: ${[t.address, t.city, [t.region, t.postalCode].filter(Boolean).join(' '), t.country].filter(Boolean).join(', ') || 'not provided'}`,
        ].join('\n'),
      )
      .join('\n\n')
    await Lead.create({
      ...data,
      category: label,
      type: 'service-request',
      subject: `Service request — ${label}`,
      notes: taskers ? `Requested taskers:\n${taskers}` : '',
    })
  } catch (err) {
    console.error('[request] save failed', err)
    return { ok: false, message: 'We couldn’t submit your request just now. Please try again in a moment.' }
  }
  await notify('service-request', {
    Name: data.name,
    Email: data.email,
    Phone: data.phone,
    Service: label,
    Message: data.message,
    Page: data.sourcePage,
    'Requested taskers': taskers ? `\n${taskers}` : 'none selected',
  })
  return { ok: true, message: 'Request sent. We’ll be in touch by email with the tasker details for your job.' }
}

const safeNext = (next: string | undefined, role: Role) => {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    if (next.startsWith('/admin') && !isAdminRole(role)) return '/account'
    return next
  }
  return isAdminRole(role) ? '/admin' : '/account'
}

const EMAIL_TAKEN: FormState = { ok: false, message: 'An account with this email already exists.', errors: { email: 'Already registered — try signing in instead.' } }

/**
 * Become A Tasker — provider account plus one pending Subscriber per category of the chosen skills.
 * An admin reviews and activates them (Admin → Subscribers) before they appear publicly or on the map.
 */
export async function registerTasker(_prev: FormState, form: FormData): Promise<FormState> {
  const hours = WEEKDAYS.map((day, i) => ({
    day,
    start: String(form.get(`hours.${i}.start`) ?? ''),
    end: String(form.get(`hours.${i}.end`) ?? ''),
    closed: form.get(`hours.${i}.closed`) === 'on',
  }))
  const parsed = taskerSchema.safeParse({ ...fd(form), skills: form.getAll('skills'), hours })
  if (!parsed.success) return { ok: false, message: CHECK_FIELDS, errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('register', 5, 30 * 60_000)) return TOO_MANY

  // Skills must name real, published sub-services; group them by category.
  const categories = await getCategories()
  const byCategory = new Map<string, string[]>()
  for (const skill of parsed.data.skills) {
    const [cat, sub] = skill.split('/')
    if (!categories.find((c) => c.slug === cat)?.subServices.some((s) => s.slug === sub)) {
      return { ok: false, message: CHECK_FIELDS, errors: { skills: 'One of the chosen skills is no longer available — please choose again.' } }
    }
    byCategory.set(cat, [...(byCategory.get(cat) ?? []), sub])
  }

  const { password, confirmPassword: _c, terms: _t, skills: _s, hours: workHours, promoCode, ...profile } = parsed.data
  await db()
  if (await User.exists({ email: profile.email })) return EMAIL_TAKEN
  let freeUntil = ''
  if (promoCode) {
    freeUntil = await claimPromoCode(promoCode)
    if (!freeUntil) return { ok: false, message: CHECK_FIELDS, errors: { promoCode: await promoCodeProblem(promoCode) } }
  }
  const user = new User({ ...profile, passwordHash: await hashPassword(password), role: 'provider' })
  try {
    await user.save()
    const location = await geocode(profile)
    await Subscriber.insertMany(
      [...byCategory].map(([category, subServices]) => ({
        name: profile.name,
        category,
        subServices,
        status: 'pending',
        published: true,
        contactName: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        region: profile.region,
        postalCode: profile.postalCode,
        country: profile.country,
        hours: workHours,
        location,
        promoCode,
        freeUntil,
        userId: user._id,
      })),
    )
  } catch (err) {
    // Don't leave a half-made account (it would block signing up again) or a promo use spent on nothing.
    console.error('[tasker] sign-up failed', err)
    await User.deleteOne({ _id: user._id })
    if (freeUntil) await releasePromoCode(promoCode)
    return { ok: false, message: 'We couldn’t create your account just now. Please try again in a moment.' }
  }
  const skillNames = [...byCategory].map(([cat, subs]) => {
    const c = categories.find((x) => x.slug === cat)!
    return `${c.name}: ${subs.map((s) => c.subServices.find((x) => x.slug === s)?.name).join(', ')}`
  })
  await Lead.create({
    type: 'provider',
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    area: [profile.city, profile.region, profile.country].filter(Boolean).join(', '),
    subject: 'New tasker sign-up — awaiting approval',
    message: `Skills — ${skillNames.join(' | ')}${promoCode ? `\nPromo code ${promoCode} — free until ${freeUntil}` : ''}`,
    sourcePage: '/become-a-tasker',
  })
  await notify('provider', { Name: profile.name, Email: profile.email, Phone: profile.phone, Skills: skillNames.join(' | '), Area: [profile.city, profile.region].filter(Boolean).join(', '), Promo: promoCode && `${promoCode} — free until ${freeUntil}` })
  await createSession(String(user._id), 'provider')
  // New taskers go straight to Stripe Checkout for the membership (their promo free period is applied there).
  // ponytail: first membership plan by admin order; add a plan picker to the sign-up form if there are several.
  const plan = isStripeConfigured && (await getPlans()).find((p) => p.billing === 'subscription' && p.payer === 'provider' && p.amount > 0)
  if (plan) {
    const checkout = new FormData()
    checkout.set('plan', plan.slug)
    await startMembership(checkout)
  }
  redirect('/account?welcome=tasker')
}

const PHOTO_MAX_BYTES = 5 * 1024 * 1024
const MAX_DAYS_AHEAD = 90

/**
 * Post an ad in a listing category. Paid ads go to Stripe Checkout and publish once paid
 * (see lib/listing-service.ts); free ads wait for an admin, who is emailed straight away.
 */
export async function submitListing(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = listingSchema.safeParse(fd(form))
  if (!parsed.success) return { ok: false, message: CHECK_FIELDS, errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('listing', 6, 60 * 60_000)) return TOO_MANY

  const { website: _hp, terms: _t, promoCode, ...data } = parsed.data
  const category = await getCategory(data.category)
  const plan = category ? await getPlan(category.plan) : null
  if (!category || plan?.billing !== 'listing') return { ok: false, message: 'Ads can’t be posted in that category right now.' }

  const errors: Record<string, string> = {}
  const today = todayISO()
  const latestStart = todayISO(new Date(Date.now() + MAX_DAYS_AHEAD * 86_400_000))
  if (data.startDate < today) errors.startDate = 'The start date can’t be in the past'
  else if (data.startDate > latestStart) errors.startDate = `Ads can be booked up to ${MAX_DAYS_AHEAD} days ahead`
  const quote = quoteListing(plan.durations, data.startDate, data.endDate)
  if (!quote && !errors.startDate) errors.endDate = data.endDate < data.startDate ? 'The end date must be on or after the start date' : `Ads can run for up to ${maxListingDays(plan.durations)} days`
  if (plan.addressRequired && data.address.length < 5) errors.address = 'Please enter the street address'

  const photo = form.get('photo')
  let photoUrl = ''
  if (!Object.keys(errors).length && photo instanceof File && photo.size > 0) {
    const stored = await storeImage(photo, 'listings', { maxBytes: PHOTO_MAX_BYTES, meta: { alt: data.title.slice(0, 300), title: data.title.slice(0, 200) } })
    if ('error' in stored) errors.photo = stored.error
    else photoUrl = stored.url
  }
  // Re-check the promo code here — the price shown in the form is only a preview.
  let promo: Awaited<ReturnType<typeof priceWithPromotionCode>> = null
  if (promoCode && quote && quote.amount > 0 && isStripeConfigured) {
    promo = await priceWithPromotionCode(promoCode, quote.amount, plan.currency || 'CAD').catch(() => null)
    if (!promo) errors.promoCode = 'That promo code isn’t valid or has expired'
  }
  if (Object.keys(errors).length || !quote) return { ok: false, message: CHECK_FIELDS, errors }

  const paid = quote.amount > 0
  const status = paid ? 'awaiting-payment' : plan.requiresApproval ? 'pending-review' : 'published'
  await db()
  const user = await getCurrentUser()
  const listing = await Listing.create({ ...data, userId: user?.id, photo: photoUrl, amount: quote.amount, currency: plan.currency || 'CAD', status })
  const summary = {
    Ad: data.title,
    Category: category.name,
    Dates: `${data.startDate} → ${data.endDate} (${quote.days} day${quote.days === 1 ? '' : 's'}, ${quote.label})`,
    Address: [data.address, data.city, data.region, data.postalCode].filter(Boolean).join(', '),
    Price: formatMoney(quote.amount, plan.currency || 'CAD') + (promo ? ` — promo ${promoCode} (${promo.label}): ${formatMoney(promo.total, plan.currency || 'CAD')}` : ''),
    Contact: `${data.contactName} <${data.email}> ${data.phone}`,
    Description: data.description,
    Admin: adminListingUrl(listing._id),
  }

  if (!paid) {
    if (status === 'published') {
      revalidatePath(`/services/${category.slug}`)
      return { ok: true, message: 'Your ad is live. Thank you for posting on Fleeket!' }
    }
    await notifyAdmin(`Free ad to approve — ${data.title}`, summary, data.email)
    return { ok: true, message: 'Thank you! Our team will check your ad and email you as soon as it’s live.' }
  }

  if (!isStripeConfigured) {
    await notifyAdmin(`Ad awaiting payment — ${data.title}`, { ...summary, Note: 'Online payment is not set up yet — contact the poster to take payment, then publish the ad.' }, data.email)
    return { ok: true, message: `Thank you! We’ve received your ad. Our team will contact you about the ${formatMoney(quote.amount, plan.currency || 'CAD')} payment, then put it live.` }
  }

  const h = await headers()
  const origin = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('x-forwarded-host') ?? h.get('host')}`
  let checkoutUrl: string | null = null
  try {
    const session = await createCheckoutSession({
      listingId: String(listing._id),
      name: `${plan.name}: ${data.title} (${data.startDate} → ${data.endDate})`.slice(0, 250),
      amount: quote.amount,
      currency: plan.currency || 'CAD',
      email: data.email,
      successUrl: `${origin}/api/listings/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/services/${category.slug}/post?done=cancelled`,
      promotionCodeId: promo?.id,
    })
    checkoutUrl = session.url
  } catch (err) {
    console.error('[listing] checkout failed', err)
  }
  if (!checkoutUrl) return { ok: false, message: 'We couldn’t open the payment page just now. Please try again in a moment.' }
  redirect(checkoutUrl)
}

/**
 * The poster edits one of their own ads. Dates and price are fixed once booked; an edited ad in a
 * reviewed category (free ads) goes back to the team before it shows again.
 */
export async function updateListing(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, message: 'Please sign in again to edit your ad.' }
  const id = String(form.get('id') ?? '')
  await db()
  const listing = isValidObjectId(id) ? await Listing.findOne({ _id: id, userId: user.id }).lean() : null
  if (!listing || listing.status === 'cancelled') return { ok: false, message: 'That ad can’t be edited.' }
  const parsed = listingSchema.safeParse({ ...fd(form), category: listing.category, startDate: listing.startDate, endDate: listing.endDate })
  if (!parsed.success) return { ok: false, message: CHECK_FIELDS, errors: flattenErrors(parsed.error) }
  if (await rateLimited('listing-edit', 20, 60 * 60_000)) return TOO_MANY

  const plan = await getCategory(listing.category).then((c) => (c ? getPlan(c.plan) : null))
  const { website: _hp, terms: _t, promoCode: _p, category: _c, startDate: _s, endDate: _e, ...data } = parsed.data
  if (plan?.addressRequired && data.address.length < 5) return { ok: false, message: CHECK_FIELDS, errors: { address: 'Please enter the street address' } }

  const photo = form.get('photo')
  let photoUrl = listing.photo
  if (photo instanceof File && photo.size > 0) {
    const stored = await storeImage(photo, 'listings', { maxBytes: PHOTO_MAX_BYTES, meta: { alt: data.title.slice(0, 300), title: data.title.slice(0, 200) } })
    if ('error' in stored) return { ok: false, message: CHECK_FIELDS, errors: { photo: stored.error } }
    photoUrl = stored.url
  }
  const recheck = Boolean(plan?.requiresApproval) && listing.status === 'published'
  await Listing.updateOne({ _id: listing._id }, { $set: { ...data, photo: photoUrl, ...(recheck && { status: 'pending-review' }) } })
  revalidatePath(`/services/${listing.category}`)
  revalidatePath('/account')
  if (recheck) {
    await notifyAdmin(`Edited ad to approve — ${data.title}`, { Ad: data.title, Category: listing.category, Contact: `${data.contactName} <${data.email}> ${data.phone}`, Description: data.description, Admin: adminListingUrl(listing._id) }, data.email)
    return { ok: true, message: 'Saved. Our team will check your changes and put the ad back live shortly.' }
  }
  return { ok: true, message: 'Your ad has been updated.' }
}

/** The poster takes one of their ads down early. No refund is implied — paid time simply ends. */
export async function closeListing(form: FormData) {
  const user = await requireUser('/account')
  const id = String(form.get('id') ?? '')
  if (!isValidObjectId(id)) return
  await db()
  const listing = await Listing.findOneAndUpdate({ _id: id, userId: user.id, status: { $ne: 'cancelled' } }, { $set: { status: 'cancelled' } }).lean()
  if (listing) revalidatePath(`/services/${listing.category}`)
  revalidatePath('/account')
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(fd(form))
  if (!parsed.success) return { ok: false, message: CHECK_FIELDS, errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('login', 8, 15 * 60_000)) return TOO_MANY

  await db()
  const user = await User.findOne({ email: parsed.data.email }).select('+passwordHash')
  const valid = user && user.active && (await verifyPassword(parsed.data.password, user.passwordHash))
  if (!user || !valid) return { ok: false, message: 'That email and password combination didn’t match.' }

  user.lastLoginAt = new Date()
  await user.save()
  await createSession(String(user._id), user.role as Role, form.get('remember') === 'on')
  redirect(safeNext(parsed.data.next, user.role as Role))
}

export async function logout() {
  await destroySession()
  redirect('/')
}

/** Live preview for the ad form's promo code box: the price for these dates with the code applied. */
export async function checkAdPromoCode(input: { code: string; category: string; startDate: string; endDate: string }): Promise<{ ok: true; total: number; label: string } | { ok: false; message: string }> {
  const code = String(input.code ?? '').trim().slice(0, 40)
  if (!code) return { ok: false, message: 'Enter a promo code' }
  if (!isStripeConfigured) return { ok: false, message: 'Promo codes aren’t available right now' }
  if (await rateLimited('ad-promo', 30, 10 * 60_000)) return { ok: false, message: 'Too many tries — please wait a few minutes' }
  const category = await getCategory(String(input.category ?? ''))
  const plan = category ? await getPlan(category.plan) : null
  const quote = plan?.billing === 'listing' ? quoteListing(plan.durations, String(input.startDate), String(input.endDate)) : null
  if (!plan || !quote) return { ok: false, message: 'Choose valid dates first' }
  if (quote.amount <= 0) return { ok: false, message: 'This ad is already free' }
  const promo = await priceWithPromotionCode(code, quote.amount, plan.currency || 'CAD').catch(() => null)
  return promo ? { ok: true, total: promo.total, label: promo.label } : { ok: false, message: 'That promo code isn’t valid or has expired' }
}
