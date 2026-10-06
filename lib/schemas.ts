import { z } from 'zod'
import { COUNTRIES, WEEKDAYS } from './constants'

const name = z.string().trim().min(2, 'Please enter your name').max(100)
const email = z.email('Please enter a valid email address').trim().toLowerCase().max(200)
const phone = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v === '' || /^[+()\d\s.-]{7,30}$/.test(v), 'Please enter a valid phone number')
const text = (max: number) => z.string().trim().max(max).default('')
const honeypot = z.string().max(0, 'Spam detected').default('') // real users never fill this

export const contactSchema = z.object({
  name,
  email,
  phone,
  subject: z.string().trim().min(3, 'Please add a subject').max(150),
  message: z.string().trim().min(10, 'Please tell us a little more (at least 10 characters)').max(5000),
  sourcePage: text(200),
  website: honeypot,
})

/** “Ready to make your choice?” — a request for the taskers of one sub-service. */
export const serviceRequestSchema = z.object({
  name,
  email,
  phone,
  category: z.string().trim().min(1).max(80),
  subService: text(80),
  providers: z.array(z.string().max(40)).max(50).default([]),
  message: z.string().trim().min(10, 'Please describe what you need (at least 10 characters)').max(3000),
  sourcePage: text(200),
  website: honeypot,
})

export const passwordSchema = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(200)
  .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), 'Include at least one letter and one number')

const profile = {
  name,
  email,
  password: passwordSchema,
  confirmPassword: z.string().max(200),
  phone,
  address: text(200),
  country: z.union([z.enum(COUNTRIES), z.literal('')]).default(''),
  city: text(80),
  region: text(60),
  postalCode: text(20),
  terms: z.literal(true, 'Please read and accept the Terms & Conditions'),
}
const passwordsMatch = (v: { password: string; confirmPassword: string }) => v.password === v.confirmPassword
const mismatch = { message: 'Passwords do not match', path: ['confirmPassword'] }

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM').or(z.literal(''))

/** Become A Tasker — provider account with skills and weekly availability. */
export const taskerSchema = z
  .object({
    ...profile,
    promoCode: text(40).transform((v) => v.toUpperCase()),
    /** “categorySlug/subServiceSlug” pairs. */
    skills: z.array(z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+$/)).min(1, 'Choose at least one skill').max(30),
    hours: z
      .array(z.object({ day: z.enum(WEEKDAYS), start: time, end: time, closed: z.boolean() }))
      .length(7),
  })
  .refine(passwordsMatch, mismatch)

const isoDate = (msg: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msg)

/** Post an ad in a listing category (open house, garage sale, free ad). Price and dates are re-checked on the server. */
export const listingSchema = z.object({
  category: z.string().trim().min(1).max(80),
  title: z.string().trim().min(4, 'Please add a short title').max(120),
  description: z.string().trim().min(10, 'Please describe your ad (at least 10 characters)').max(3000),
  startDate: isoDate('Choose a start date'),
  endDate: isoDate('Choose an end date'),
  address: text(200),
  city: z.string().trim().min(2, 'Please enter the city').max(80),
  region: text(60),
  postalCode: text(20),
  contactName: name,
  email,
  phone,
  terms: z.literal(true, 'Please read and accept the Terms & Conditions'),
  website: honeypot,
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
