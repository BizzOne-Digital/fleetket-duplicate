'use server'

import { redirect } from 'next/navigation'
import { db, getContent } from '@/lib/content'
import { isDbConfigured } from '@/lib/db'
import { Lead, User } from '@/lib/models'
import { contactSchema, flattenErrors, loginSchema, providerSchema, registerSchema, serviceRequestSchema, type FormState } from '@/lib/schemas'
import { createSession, destroySession, hashPassword, verifyPassword } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { rateLimited } from '@/lib/rate-limit'
import { isAdminRole, LEAD_TYPE_LABELS, type LeadType, type Role } from '@/lib/constants'

const NOT_CONFIGURED: FormState = {
  ok: false,
  message: 'Our forms are temporarily unavailable. Please email fleeket@outlook.com and we’ll respond directly.',
}
const TOO_MANY: FormState = { ok: false, message: 'Too many attempts. Please wait a few minutes and try again.' }

const fd = (form: FormData) => {
  const o = Object.fromEntries(form.entries()) as Record<string, unknown>
  for (const k of ['consent', 'terms']) o[k] = form.get(k) === 'on'
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
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('contact', 5, 10 * 60_000)) return TOO_MANY

  const { website: _hp, ...data } = parsed.data
  const type: LeadType = data.reason === 'I want to advertise my service' ? 'provider' : data.reason === 'I need a service' ? 'service-request' : 'contact'
  try {
    await db()
    await Lead.create({ ...data, type })
  } catch (err) {
    console.error('[contact] save failed', err)
    return { ok: false, message: 'We couldn’t send your message just now. Please try again in a moment.' }
  }
  await notify(type, {
    Name: data.name,
    Email: data.email,
    Phone: data.phone,
    Business: data.business,
    Reason: data.reason,
    Category: data.category,
    Subject: data.subject,
    Message: data.message,
    Page: data.sourcePage,
  })
  return { ok: true, message: 'Thank you — your message has been received. Our team will reply to you by email.' }
}

export async function submitProviderListing(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = providerSchema.safeParse(fd(form))
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('provider', 5, 10 * 60_000)) return TOO_MANY

  const { website: _hp, ...data } = parsed.data
  try {
    await db()
    await Lead.create({ ...data, type: 'provider', subject: `Listing request — ${data.business}` })
  } catch (err) {
    console.error('[provider] save failed', err)
    return { ok: false, message: 'We couldn’t submit your listing request just now. Please try again in a moment.' }
  }
  await notify('provider', {
    Name: data.name,
    Email: data.email,
    Phone: data.phone,
    Business: data.business,
    Category: data.category,
    Area: data.area,
    Message: data.message,
  })
  return { ok: true, message: 'Thanks — your listing request is in. Our team will contact you to get your service live.' }
}

export async function submitServiceRequest(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = serviceRequestSchema.safeParse(fd(form))
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('request', 5, 10 * 60_000)) return TOO_MANY

  const { website: _hp, ...data } = parsed.data
  try {
    await db()
    await Lead.create({ ...data, type: 'service-request', subject: `Service request — ${data.category}` })
  } catch (err) {
    console.error('[request] save failed', err)
    return { ok: false, message: 'We couldn’t submit your request just now. Please try again in a moment.' }
  }
  await notify('service-request', {
    Name: data.name,
    Email: data.email,
    Phone: data.phone,
    Category: data.category,
    Area: data.area,
    Message: data.message,
    Page: data.sourcePage,
  })
  return { ok: true, message: 'Request received. Our team will be in touch by email about providers for your job.' }
}

const safeNext =(next: string | undefined, role: Role) => {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    if (next.startsWith('/admin') && !isAdminRole(role)) return '/account'
    return next
  }
  return isAdminRole(role) ? '/admin' : '/account'
}

export async function register(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(fd(form))
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('register', 5, 30 * 60_000)) return TOO_MANY

  const { name, email, password, accountType } = parsed.data
  await db()
  if (await User.exists({ email })) {
    return { ok: false, message: 'An account with this email already exists.', errors: { email: 'Already registered — try signing in instead.' } }
  }
  const user = await User.create({ name, email, passwordHash: await hashPassword(password), role: accountType })
  await createSession(String(user._id), accountType)
  redirect('/account?welcome=1')
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(fd(form))
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: flattenErrors(parsed.error) }
  if (!isDbConfigured) return NOT_CONFIGURED
  if (await rateLimited('login', 8, 15 * 60_000)) return TOO_MANY

  await db()
  const user = await User.findOne({ email: parsed.data.email }).select('+passwordHash')
  const valid = user && user.active && (await verifyPassword(parsed.data.password, user.passwordHash))
  if (!user || !valid) return { ok: false, message: 'That email and password combination didn’t match.' }

  user.lastLoginAt = new Date()
  await user.save()
  await createSession(String(user._id), user.role as Role)
  redirect(safeNext(parsed.data.next, user.role as Role))
}

export async function logout() {
  await destroySession()
  redirect('/')
}
