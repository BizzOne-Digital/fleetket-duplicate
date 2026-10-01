import { z } from 'zod'
import { CONTACT_REASONS } from './constants'

const name = z.string().trim().min(2, 'Please enter your name').max(100)
const email = z.email('Please enter a valid email address').trim().toLowerCase().max(200)
const phone = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v === '' || /^[+()\d\s.-]{7,30}$/.test(v), 'Please enter a valid phone number')

export const contactSchema = z.object({
  name,
  email,
  phone,
  business: z.string().trim().max(120),
  subject: z.string().trim().min(3, 'Please add a subject').max(150),
  reason: z.enum(CONTACT_REASONS, 'Please choose a reason'),
  category: z.string().trim().max(80),
  message: z.string().trim().min(10, 'Please tell us a little more (at least 10 characters)').max(5000),
  consent: z.literal(true, 'Please agree so we can respond to you'),
  sourcePage: z.string().trim().max(200),
  website: z.string().max(0, 'Spam detected'), // honeypot — real users never fill this
})

export const providerSchema = z.object({
  name,
  email,
  phone,
  business: z.string().trim().min(2, 'Please enter your business or trade name').max(120),
  category: z.string().trim().min(1, 'Please choose the category you serve').max(80),
  area: z.string().trim().min(2, 'Please tell us where you work').max(160),
  message: z.string().trim().max(3000),
  consent: z.literal(true, 'Please agree so we can contact you'),
  sourcePage: z.string().trim().max(200),
  website: z.string().max(0, 'Spam detected'),
})

export const serviceRequestSchema = z.object({
  name,
  email,
  phone,
  category: z.string().trim().min(1, 'Please choose a service').max(80),
  area: z.string().trim().min(2, 'Please tell us where you need the service').max(160),
  message: z.string().trim().min(10, 'Please describe what you need (at least 10 characters)').max(3000),
  consent: z.literal(true, 'Please agree so we can contact you'),
  sourcePage: z.string().trim().max(200),
  website: z.string().max(0, 'Spam detected'),
})

export const passwordSchema = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(200)
  .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), 'Include at least one letter and one number')

export const registerSchema = z.object({
  name,
  email,
  password: passwordSchema,
  accountType: z.enum(['customer', 'provider'], 'Choose an account type'),
  terms: z.literal(true, 'Please accept the terms to continue'),
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password').max(200),
  next: z.string().max(200).optional(),
})

export type FieldErrors = Record<string, string>
export type FormState = { ok: boolean; message: string; errors?: FieldErrors } | null

export function flattenErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    out[key] ??= issue.message
  }
  return out
}
