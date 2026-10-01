'use server'

import { redirect } from 'next/navigation'
import { isValidObjectId } from 'mongoose'
import { db, getCategories, getContent } from '@/lib/content'
import { isDbConfigured } from '@/lib/db'
import { Lead, Subscriber, User } from '@/lib/models'
import { contactSchema, flattenErrors, loginSchema, memberSchema, serviceRequestSchema, taskerSchema, type FormState } from '@/lib/schemas'
import { createSession, destroySession, hashPassword, verifyPassword } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { rateLimited } from '@/lib/rate-limit'
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

async function notify(type: LeadType, fields: Record<string, string>) {
  const site = await getContent('site')
  const to = site.notifyEmail || site.contactEmail
  if (!to) return
  const body = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  await sendEmail({ to, subject: `New ${LEAD_TYPE_LABELS[type].toLowerCase()} — ${fields.Name}`, text: body, replyTo: fields.Email })
}

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
  try {
    await db()
    const ids = providers.filter((id) => isValidObjectId(id))
    const chosen = ids.length ? await Subscriber.find({ _id: { $in: ids }, category: category.slug }).select('name').lean() : []
    await Lead.create({
      ...data,
      category: label,
      type: 'service-request',
      subject: `Service request — ${label}`,
      notes: chosen.length ? `Requested taskers: ${chosen.map((c) => c.name).join(', ')}` : '',
    })
  } catch (err) {
    console.error('[request] save failed', err)
    return { ok: false, message: 'We couldn’t submit your request just now. Please try again in a moment.' }
  }
  await notify('service-request', { Name: data.name, Email: data.email, Phone: data.phone, Service: label, Message: data.message, Page: data.sourcePage })
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

/** Be Our Member — customer account. */
export async function registerMember(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = memberSchema.safeParse(fd(form))
  if (!parsed.success) return { ok: false, message: CHECK_FIELDS, errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('register', 5, 30 * 60_000)) return TOO_MANY

  const { password, confirmPassword: _c, terms: _t, ...profile } = parsed.data
  await db()
  if (await User.exists({ email: profile.email })) return EMAIL_TAKEN
  const user = await User.create({ ...profile, passwordHash: await hashPassword(password), role: 'customer' })
  await createSession(String(user._id), 'customer')
  redirect('/account?welcome=1')
}

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

  const { password, confirmPassword: _c, terms: _t, skills: _s, hours: workHours, ...profile } = parsed.data
  await db()
  if (await User.exists({ email: profile.email })) return EMAIL_TAKEN
  const user = await User.create({ ...profile, passwordHash: await hashPassword(password), role: 'provider' })
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
      userId: user._id,
    })),
  )
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
    message: `Skills — ${skillNames.join(' | ')}`,
    sourcePage: '/become-a-tasker',
  })
  await notify('provider', { Name: profile.name, Email: profile.email, Phone: profile.phone, Skills: skillNames.join(' | '), Area: [profile.city, profile.region].filter(Boolean).join(', ') })
  await createSession(String(user._id), 'provider')
  redirect('/account?welcome=tasker')
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
