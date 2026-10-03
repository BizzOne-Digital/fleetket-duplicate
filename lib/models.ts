import 'server-only'
import mongoose, { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'
import { LEAD_STATUSES, LEAD_TYPES, LISTING_STATUSES, PLAN_BILLING, PLAN_INTERVALS, PLAN_PAYERS, ROLES, SUBSCRIBER_STATUSES, UPLOAD_FOLDERS } from './constants'

const faqItem = new Schema({ q: { type: String, required: true }, a: { type: String, required: true } }, { _id: false })

const subServiceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    /** ID on the previous fleeket.com — keeps /ServiceCategory/:id/:subId links working. */
    legacyId: { type: Number },
  },
  { _id: false },
)

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    /** ID on the previous fleeket.com — keeps /ServiceCategory/:id links working. */
    legacyId: { type: Number, index: true },
    subServices: { type: [subServiceSchema], default: [] },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    group: { type: String, required: true, trim: true },
    icon: { type: String, default: 'sparkles' },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    needs: { type: [String], default: [] },
    serviceTypes: { type: [String], default: [] },
    faqs: { type: [faqItem], default: [] },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    /** Slug of a Plan. Empty = the site-wide connection fee (Admin → Pricing page). */
    plan: { type: String, default: '' },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

/** A payment/subscription strategy a category can use instead of the default connection fee. */
const planSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    billing: { type: String, enum: PLAN_BILLING, default: 'subscription' },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: '' },
    interval: { type: String, enum: PLAN_INTERVALS, default: 'month' },
    trialDays: { type: Number, default: 0 },
    payer: { type: String, enum: PLAN_PAYERS, default: 'provider' },
    summary: { type: String, default: '' },
    includes: { type: [String], default: [] },
    /** billing = listing: how long an ad can run and what each length costs (the cheapest option that covers it applies). */
    durations: {
      type: [new Schema({ label: String, days: Number, amount: Number }, { _id: false })],
      default: [],
    },
    /** billing = listing: ads wait for an admin to publish them (e.g. free ads). */
    requiresApproval: { type: Boolean, default: false },
    /** billing = listing: the poster must give a street address (open houses, garage sales). */
    addressRequired: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

/** A service provider subscribed to Fleeket — shown on the maps when public and active. */
const subscriberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: '' },
    plan: { type: String, default: '' },
    status: { type: String, enum: SUBSCRIBER_STATUSES, default: 'active' },
    /** Sub-service slugs within the category (the “skills” chosen at sign-up). */
    subServices: { type: [String], default: [] },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    region: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' },
    hours: {
      type: [new Schema({ day: String, start: String, end: String, closed: Boolean }, { _id: false })],
      default: [],
    },
    /** The provider account that signed up, if any. */
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    location: { type: new Schema({ lat: Number, lng: Number }, { _id: false }), default: null },
    contactName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    notes: { type: String, default: '' },
    /** Show on the public map (only while status is active or trial). */
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)
subscriberSchema.index({ status: 1, published: 1 })

/** An ad posted in a listing category: an open house, a garage sale or a free ad (lost pet…). */
const listingSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    status: { type: String, enum: LISTING_STATUSES, default: 'pending-review' },
    /** YYYY-MM-DD, inclusive. Strings so “ends today” never shifts with the server's time zone. */
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    description: { type: String, default: '' },
    photo: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    region: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' },
    contactName: { type: String, default: '' },
    /** Private — used for payment receipts and approval emails. */
    email: { type: String, default: '', lowercase: true },
    /** Shown on the ad. */
    phone: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'CAD' },
    /** Stripe Checkout session id once paid. */
    paymentRef: { type: String, default: '' },
    paidAt: { type: Date },
    notes: { type: String, default: '' },
    /** Admin hide switch, on top of status. */
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)
listingSchema.index({ category: 1, status: 1, endDate: 1 })

const citySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    country: { type: String, enum: ['CA', 'US'], default: 'CA' },
    kind: { type: String, enum: ['province', 'territory', 'state', 'city', 'region'], default: 'province' },
    region: { type: String, default: '' },
    regionCode: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    categories: { type: [String], default: [] },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    topic: { type: String, default: 'General' },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const leadSchema = new Schema(
  {
    type: { type: String, enum: LEAD_TYPES, default: 'contact', index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, default: '' },
    business: { type: String, default: '' },
    subject: { type: String, default: '' },
    reason: { type: String, default: '' },
    category: { type: String, default: '' },
    area: { type: String, default: '' },
    message: { type: String, default: '' },
    sourcePage: { type: String, default: '' },
    consent: { type: Boolean, default: false },
    status: { type: String, enum: LEAD_STATUSES, default: 'new', index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
)
leadSchema.index({ createdAt: -1 })

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'customer' },
    active: { type: Boolean, default: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    region: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
)

/** Keyed JSON documents: page copy, pricing, site settings, SEO, legal. Shapes live in lib/content-schema.ts. */
const contentSchema = new Schema(
  { key: { type: String, required: true, unique: true }, value: { type: Schema.Types.Mixed, default: {} } },
  { timestamps: true, minimize: false },
)

const storedUploadSchema = new Schema(
  {
    folder: { type: String, enum: UPLOAD_FOLDERS, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { timestamps: true },
)
storedUploadSchema.index({ folder: 1, filename: 1 }, { unique: true })

function getModel<T extends Schema>(name: string, schema: T) {
  return (models[name] as Model<InferSchemaType<T>>) || model(name, schema)
}

export const Category = getModel('Category', categorySchema)
export const Plan = getModel('Plan', planSchema)
export const Subscriber = getModel('Subscriber', subscriberSchema)
export const Listing = getModel('Listing', listingSchema)
export const City = getModel('City', citySchema)
export const Faq = getModel('Faq', faqSchema)
export const Lead = getModel('Lead', leadSchema)
export const User = getModel('User', userSchema)
export const Content = getModel('Content', contentSchema)
export const StoredUpload = getModel('StoredUpload', storedUploadSchema)

export type LeadDoc = InferSchemaType<typeof leadSchema> & { _id: mongoose.Types.ObjectId }
