import 'server-only'
import mongoose, { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'
import { LEAD_STATUSES, LEAD_TYPES, ROLES, UPLOAD_FOLDERS } from './constants'

const faqItem = new Schema({ q: { type: String, required: true }, a: { type: String, required: true } }, { _id: false })

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
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
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

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
export const City = getModel('City', citySchema)
export const Faq = getModel('Faq', faqSchema)
export const Lead = getModel('Lead', leadSchema)
export const User = getModel('User', userSchema)
export const Content = getModel('Content', contentSchema)
export const StoredUpload = getModel('StoredUpload', storedUploadSchema)

export type LeadDoc = InferSchemaType<typeof leadSchema> & { _id: mongoose.Types.ObjectId }
