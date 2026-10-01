// Shared between server and client — no server-only imports here.

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'closed', 'spam'] as const
export const LEAD_TYPES = ['contact', 'provider', 'service-request'] as const
export const ROLES = ['owner', 'admin', 'editor', 'provider', 'customer'] as const
export const ADMIN_ROLES = ['owner', 'admin', 'editor'] as const
export const UPLOAD_FOLDERS = ['products', 'gallery', 'pages', 'misc'] as const
export const UPLOAD_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const UPLOAD_MAX_BYTES = 8 * 1024 * 1024

export const CONTACT_REASONS = [
  'I need a service',
  'I want to advertise my service',
  'Partnership or media',
  'Account or payment help',
  'Something else',
] as const

export const CATEGORY_GROUPS = [
  'Home & Property',
  'Auto & Transport',
  'Family & Learning',
  'Wellness & Lifestyle',
  'Events & Creative',
  'Business & Local',
] as const

/** Must match the map in components/category-icon.tsx. */
export const ICON_KEYS = [
  'sparkles', 'spray-can', 'hammer', 'truck', 'bug', 'snowflake', 'monitor-smartphone', 'ruler', 'wrench', 'life-buoy',
  'car', 'car-front', 'baby', 'graduation-cap', 'paw-print', 'heart-pulse', 'compass', 'shirt', 'scissors', 'chef-hat',
  'calendar-days', 'camera', 'house', 'calculator', 'sprout', 'tag',
] as const

export type LeadStatus =(typeof LEAD_STATUSES)[number]
export type LeadType = (typeof LEAD_TYPES)[number]
export type Role = (typeof ROLES)[number]
export type AdminRole = (typeof ADMIN_ROLES)[number]
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number]

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  contact: 'Contact message',
  provider: 'Provider listing',
  'service-request': 'Service request',
}

const oneOf = <T extends readonly string[]>(list: T) => (v: unknown): v is T[number] => typeof v === 'string' && list.includes(v)
export const isUploadFolder = oneOf(UPLOAD_FOLDERS)
export const isLeadStatus = oneOf(LEAD_STATUSES)
export const isLeadType = oneOf(LEAD_TYPES)

export const isAdminRole = (role: string | undefined): role is AdminRole =>
  (ADMIN_ROLES as readonly string[]).includes(role ?? '')

/** Editors manage content; only owners/admins manage people and site settings. */
export const canManageUsers = (role: string | undefined) => role === 'owner' || role === 'admin'
