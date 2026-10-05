'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { isValidObjectId } from 'mongoose'
import { requireAdmin, hashPassword } from '@/lib/auth'
import { db } from '@/lib/content'
import { Content, Lead, StoredUpload, User } from '@/lib/models'
import { RESOURCE_MODELS, findBrokenReference } from '@/lib/resource-models'
import { schemaFromFields } from '@/lib/fields'
import { PROMO_CODE_RE, RESOURCE_DEFS, SLUG_RE, isResourceKey } from '@/lib/resources'
import { CONTENT_DEFS, isContentKey } from '@/lib/content-schema'
import { canManageUsers, LEAD_STATUSES, ROLES } from '@/lib/constants'
import { passwordSchema, flattenErrors } from '@/lib/schemas'
import { deleteReplacedUploads, deleteUploadByUrl } from '@/lib/uploads'
import { emailListingLive } from '@/lib/listing-service'
import { geocode } from '@/lib/geocode'

export type ActionResult = { ok: boolean; message: string; errors?: Record<string, string>; id?: string }

const refreshSite = () => revalidatePath('/', 'layout')
const bad = (message: string, errors?: Record<string, string>): ActionResult => ({ ok: false, message, errors })
const validId = (id: string) => isValidObjectId(id)

async function guard(opts: { manageUsers?: boolean } = {}) {
  const user = await requireAdmin()
  if (opts.manageUsers && !canManageUsers(user.role)) throw new Error('Only owners and admins can do that')
  await db()
  return user
}

/* ---------- Generic resources: categories, cities, FAQs ---------- */

export async function saveResource(key: string, id: string | null, input: unknown): Promise<ActionResult> {
  if (!isResourceKey(key)) return bad('Unknown resource')
  await guard()
  const def = RESOURCE_DEFS[key]
  const parsed = schemaFromFields(def.fields).safeParse(input)
  if (!parsed.success) return bad('Please fix the highlighted fields.', flattenErrors(parsed.error))
  const data = parsed.data as Record<string, unknown>
  const model = RESOURCE_MODELS[key]
  const broken = await findBrokenReference(def.fields, data)
  if (broken) return bad('Please fix the highlighted fields.', { [broken]: 'That item no longer exists — choose another' })

  if (def.hasSlug) {
    data.slug = String(data.slug).toLowerCase()
    if (!SLUG_RE.test(String(data.slug))) return bad('Please fix the highlighted fields.', { slug: 'Use lowercase letters, numbers and single dashes' })
    const clash = await model.exists({ slug: data.slug, ...(id && validId(id) ? { _id: { $ne: id } } : {}) })
    if (clash) return bad('Please fix the highlighted fields.', { slug: 'Another item already uses this slug' })
  }

  if (key === 'promoCodes') {
    data.code = String(data.code).toUpperCase()
    const errors: Record<string, string> = {}
    if (!PROMO_CODE_RE.test(String(data.code))) errors.code = 'Use 3–40 letters, numbers and dashes'
    else if (await model.exists({ code: data.code, ...(id && validId(id) ? { _id: { $ne: id } } : {}) })) errors.code = 'Another promo code already uses this'
    if (data.expiresOn && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.expiresOn))) errors.expiresOn = 'Use YYYY-MM-DD'
    if (Object.keys(errors).length) return bad('Please fix the highlighted fields.', errors)
  }

  // A subscriber without a pin gets one from their address, so they can show on the map.
  if (key === 'subscribers' && !data.location) data.location = await geocode(data as Parameters<typeof geocode>[0])

  if (id) {
    if (!validId(id)) return bad('Item not found')
    const before = await model.findById(id).lean()
    if (!before) return bad('Item not found')
    await model.updateOne({ _id: id }, { $set: data })
    await deleteReplacedUploads(before, data)
    // Approving an ad (e.g. a free ad) tells the poster it's live.
    if (key === 'listings' && before.status !== 'published' && data.status === 'published') await emailListingLive({ ...before, ...data } as Parameters<typeof emailListingLive>[0])
    refreshSite()
    return { ok: true, message: `${def.singular} saved`, id }
  }

  const last = await model.findOne().sort({ order: -1 }).select('order').lean<{ order?: number }>()
  const created = await model.create({ ...data, order: (last?.order ?? -1) + 1 })
  refreshSite()
  return { ok: true, message: `${def.singular} created`, id: String(created._id) }
}

export async function deleteResources(key: string, ids: string[]): Promise<ActionResult> {
  if (!isResourceKey(key)) return bad('Unknown resource')
  await guard()
  const valid = ids.filter(validId)
  const model = RESOURCE_MODELS[key]
  const docs = await model.find({ _id: { $in: valid } }).lean()
  await model.deleteMany({ _id: { $in: valid } })
  await Promise.all(docs.map((d) => deleteReplacedUploads(d, null)))
  refreshSite()
  return { ok: true, message: `${docs.length} ${docs.length === 1 ? 'item' : 'items'} deleted` }
}

export async function setPublished(key: string, ids: string[], published: boolean): Promise<ActionResult> {
  if (!isResourceKey(key)) return bad('Unknown resource')
  await guard()
  await RESOURCE_MODELS[key].updateMany({ _id: { $in: ids.filter(validId) } }, { $set: { published } })
  refreshSite()
  return { ok: true, message: published ? 'Published' : 'Hidden from the site' }
}

export async function moveResource(key: string, id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  if (!isResourceKey(key) || !validId(id)) return bad('Item not found')
  await guard()
  const model = RESOURCE_MODELS[key]
  // Normalise order first so swaps are always well defined.
  const all = await model.find().sort({ order: 1, _id: 1 }).select('_id').lean()
  const ids = all.map((d) => String(d._id))
  const i = ids.indexOf(id)
  const j = direction === 'up' ? i - 1 : i + 1
  if (i < 0 || j < 0 || j >= ids.length) return { ok: true, message: 'Already at the edge' }
  ;[ids[i], ids[j]] = [ids[j], ids[i]]
  await model.bulkWrite(ids.map((_id, order) => ({ updateOne: { filter: { _id }, update: { $set: { order } } } })))
  refreshSite()
  return { ok: true, message: 'Order updated' }
}

/* ---------- Keyed content: pages, pricing, legal, settings, SEO ---------- */

export async function saveContent(key: string, input: unknown): Promise<ActionResult> {
  if (!isContentKey(key)) return bad('Unknown content')
  const def = CONTENT_DEFS[key]
  await guard({ manageUsers: def.section === 'Settings' })
  const parsed = schemaFromFields(def.fields).safeParse(input)
  if (!parsed.success) return bad('Please fix the highlighted fields.', flattenErrors(parsed.error))
  const before = await Content.findOne({ key }).lean()
  await Content.updateOne({ key }, { $set: { value: parsed.data } }, { upsert: true })
  await deleteReplacedUploads(before?.value, parsed.data)
  refreshSite()
  return { ok: true, message: `${def.title} saved` }
}

/* ---------- Leads ---------- */

const leadUpdate = z.object({ status: z.enum(LEAD_STATUSES), notes: z.string().max(10000) })

export async function updateLead(id: string, input: unknown): Promise<ActionResult> {
  if (!validId(id)) return bad('Lead not found')
  await guard()
  const parsed = leadUpdate.safeParse(input)
  if (!parsed.success) return bad('Invalid update', flattenErrors(parsed.error))
  await Lead.updateOne({ _id: id }, { $set: parsed.data })
  revalidatePath('/admin', 'layout')
  return { ok: true, message: 'Lead updated' }
}

export async function bulkLeads(ids: string[], action: 'delete' | (typeof LEAD_STATUSES)[number]): Promise<ActionResult> {
  await guard()
  const valid = ids.filter(validId)
  if (action === 'delete') await Lead.deleteMany({ _id: { $in: valid } })
  else if ((LEAD_STATUSES as readonly string[]).includes(action)) await Lead.updateMany({ _id: { $in: valid } }, { $set: { status: action } })
  else return bad('Unknown action')
  revalidatePath('/admin', 'layout')
  return { ok: true, message: action === 'delete' ? `${valid.length} deleted` : `${valid.length} marked ${action}` }
}

/* ---------- Users ---------- */

const newUser = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase(),
  password: passwordSchema,
  role: z.enum(ROLES),
})

export async function createUser(input: unknown): Promise<ActionResult> {
  const me = await guard({ manageUsers: true })
  const parsed = newUser.safeParse(input)
  if (!parsed.success) return bad('Please fix the highlighted fields.', flattenErrors(parsed.error))
  if (parsed.data.role === 'owner' && me.role !== 'owner') return bad('Only an owner can create another owner')
  if (await User.exists({ email: parsed.data.email })) return bad('Please fix the highlighted fields.', { email: 'This email is already registered' })
  const { password, ...rest } = parsed.data
  await User.create({ ...rest, passwordHash: await hashPassword(password) })
  revalidatePath('/admin/users')
  return { ok: true, message: 'User created' }
}

export async function updateUser(id: string, input: { role?: string; active?: boolean }): Promise<ActionResult> {
  const me = await guard({ manageUsers: true })
  if (!validId(id)) return bad('User not found')
  if (id === me.id) return bad('You can’t change your own role or status')
  const target = await User.findById(id)
  if (!target) return bad('User not found')
  if ((target.role === 'owner' || input.role === 'owner') && me.role !== 'owner') return bad('Only an owner can change owner accounts')
  if (input.role !== undefined) {
    if (!(ROLES as readonly string[]).includes(input.role)) return bad('Invalid role')
    target.role = input.role as (typeof ROLES)[number]
  }
  if (input.active !== undefined) target.active = input.active
  await target.save()
  revalidatePath('/admin/users')
  return { ok: true, message: 'User updated' }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const me = await guard({ manageUsers: true })
  if (!validId(id) || id === me.id) return bad('You can’t delete this account')
  const target = await User.findById(id).lean()
  if (!target) return bad('User not found')
  if (target.role === 'owner' && me.role !== 'owner') return bad('Only an owner can delete an owner')
  await User.deleteOne({ _id: id })
  revalidatePath('/admin/users')
  return { ok: true, message: 'User deleted' }
}

/* ---------- Media ---------- */

const mediaUpdate = z.object({
  alt: z.string().trim().max(300),
  title: z.string().trim().max(200),
  description: z.string().trim().max(2000),
})

export async function updateMedia(id: string, input: unknown): Promise<ActionResult> {
  if (!validId(id)) return bad('File not found')
  await guard()
  const parsed = mediaUpdate.safeParse(input)
  if (!parsed.success) return bad('Invalid details', flattenErrors(parsed.error))
  await StoredUpload.updateOne({ _id: id }, { $set: parsed.data })
  revalidatePath('/admin/media')
  return { ok: true, message: 'Details saved' }
}

export async function deleteMedia(url: string): Promise<ActionResult> {
  await guard()
  const deleted = await deleteUploadByUrl(url)
  revalidatePath('/admin/media')
  return deleted ? { ok: true, message: 'File deleted' } : bad('File not found')
}
