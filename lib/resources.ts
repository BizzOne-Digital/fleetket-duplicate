import { CATEGORY_GROUPS, ICON_KEYS } from './constants'
import { seoFields, type FieldSpec } from './fields'

export type ResourceDef = {
  title: string
  singular: string
  /** Public paths that render this resource; revalidated after any change. */
  publicPath: string
  fields: FieldSpec[]
  columns: { key: string; label: string }[]
  searchKeys: string[]
  hasSlug: boolean
}

const slugField: FieldSpec = {
  name: 'slug',
  label: 'URL slug',
  type: 'text',
  required: true,
  max: 80,
  help: 'Lowercase letters, numbers and dashes. Changing it changes the public URL.',
}

export const RESOURCE_DEFS = {
  categories: {
    title: 'Service categories',
    singular: 'Category',
    publicPath: '/services',
    hasSlug: true,
    searchKeys: ['name', 'slug', 'group'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'group', label: 'Group' },
      { key: 'slug', label: 'Slug' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 80 },
      slugField,
      { name: 'group', label: 'Group', type: 'select', options: CATEGORY_GROUPS },
      { name: 'icon', label: 'Icon', type: 'select', options: ICON_KEYS },
      { name: 'shortDescription', label: 'Short description', type: 'textarea', rows: 2, max: 240, help: 'Used on cards and listings.' },
      { name: 'description', label: 'Overview', type: 'textarea', rows: 5 },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'imageAlt', label: 'Image alt text', type: 'text' },
      { name: 'needs', label: 'Common customer needs (one per line)', type: 'lines' },
      { name: 'serviceTypes', label: 'Related service types (one per line)', type: 'lines' },
      {
        name: 'faqs',
        label: 'Category FAQs',
        type: 'repeater',
        itemLabel: 'Question',
        fields: [
          { name: 'q', label: 'Question', type: 'text', required: true },
          { name: 'a', label: 'Answer', type: 'textarea', rows: 3, required: true },
        ],
      },
      { name: 'featured', label: 'Feature on the home page search', type: 'checkbox' },
      { name: 'published', label: 'Published', type: 'checkbox' },
      ...seoFields,
    ],
  },
  cities: {
    title: 'Areas served',
    singular: 'Area',
    publicPath: '/cities',
    hasSlug: true,
    searchKeys: ['name', 'slug', 'regionCode'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'country', label: 'Country' },
      { key: 'kind', label: 'Type' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 80 },
      slugField,
      { name: 'country', label: 'Country', type: 'select', options: ['CA', 'US'] },
      { name: 'kind', label: 'Type', type: 'select', options: ['province', 'territory', 'state', 'city', 'region'] },
      { name: 'region', label: 'Parent province / state', type: 'text', help: 'For cities and regions, e.g. “Ontario”.' },
      { name: 'regionCode', label: 'Region code', type: 'text', max: 6, help: 'e.g. ON, BC, NY' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
      { name: 'image', label: 'Featured image', type: 'image' },
      { name: 'categories', label: 'Highlighted category slugs (one per line)', type: 'lines', help: 'Leave empty to show all categories.' },
      { name: 'published', label: 'Published', type: 'checkbox' },
      ...seoFields,
    ],
  },
  faqs: {
    title: 'FAQs',
    singular: 'FAQ',
    publicPath: '/faq',
    hasSlug: false,
    searchKeys: ['question', 'topic'],
    columns: [
      { key: 'question', label: 'Question' },
      { key: 'topic', label: 'Topic' },
    ],
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true, max: 240 },
      { name: 'answer', label: 'Answer', type: 'textarea', rows: 5, required: true },
      { name: 'topic', label: 'Topic', type: 'select', options: ['General', 'Customers', 'Providers', 'Pricing & payments'] },
      { name: 'published', label: 'Published', type: 'checkbox' },
    ],
  },
} satisfies Record<string, ResourceDef>

export type ResourceKey = keyof typeof RESOURCE_DEFS
export const isResourceKey = (k: string): k is ResourceKey => k in RESOURCE_DEFS
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
