import { CATEGORY_GROUPS, LISTING_STATUSES, PLAN_BILLING, PLAN_INTERVALS, PLAN_PAYERS, SUBSCRIBER_STATUSES } from './constants'
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
      { name: 'description', label: 'Description', type: 'textarea', rows: 5 },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'imageAlt', label: 'Image alt text', type: 'text' },
      {
        name: 'subServices',
        label: 'Sub-services',
        type: 'repeater',
        itemLabel: 'Sub-service',
        help: 'The services listed on the category page (e.g. Car Detailing under Automotive). Taskers pick these as skills.',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true, max: 80 },
          { name: 'slug', label: 'URL slug', type: 'text', required: true, max: 80, help: 'Lowercase letters, numbers and dashes.' },
          { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
          { name: 'image', label: 'Image', type: 'image' },
          { name: 'legacyId', label: 'Old site ID', type: 'number', min: 0, help: 'Keeps old fleeket.com links working. Leave 0 for new sub-services.' },
        ],
      },
      {
        name: 'plan',
        label: 'Pricing plan',
        type: 'reference',
        resource: 'plans',
        emptyLabel: 'Default — connection fee (Admin → Connection fee)',
        help: 'How customers or providers pay for this category. Manage plans under Pricing plans.',
      },
      { name: 'legacyId', label: 'Old site ID', type: 'number', min: 0, help: 'The ID used on the previous fleeket.com (/ServiceCategory/32). Keeps old links working.' },
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
  plans: {
    title: 'Pricing plans',
    singular: 'Plan',
    publicPath: '/pricing',
    hasSlug: true,
    searchKeys: ['name', 'slug'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'billing', label: 'Billing' },
      { key: 'payer', label: 'Paid by' },
    ],
    fields: [
      { name: 'name', label: 'Plan name', type: 'text', required: true, max: 80 },
      slugField,
      { name: 'billing', label: 'Billing', type: 'select', options: PLAN_BILLING, help: 'One-time fee per connection, a recurring subscription, or “listing” — pay per ad, priced by how long it runs.' },
      { name: 'amount', label: 'Price', type: 'number', step: 0.01, min: 0 },
      { name: 'currency', label: 'Currency code', type: 'text', max: 3, help: 'e.g. CAD or USD. Leave blank to show the amount only.' },
      { name: 'interval', label: 'Billing interval', type: 'select', options: PLAN_INTERVALS, help: 'Used for subscriptions only.' },
      { name: 'trialDays', label: 'Free trial (days)', type: 'number', min: 0, help: '0 for no trial. Subscriptions only.' },
      { name: 'payer', label: 'Paid by', type: 'select', options: PLAN_PAYERS },
      { name: 'summary', label: 'Summary', type: 'textarea', rows: 2, max: 300, help: 'One or two sentences shown with the price.' },
      { name: 'includes', label: 'What is included (one per line)', type: 'lines' },
      {
        name: 'durations',
        label: 'Ad lengths and prices (listing plans)',
        type: 'repeater',
        itemLabel: 'Option',
        help: 'The poster picks start and end dates; the cheapest option that covers them is charged. Price 0 = free.',
        fields: [
          { name: 'label', label: 'Label', type: 'text', required: true, max: 40, help: 'e.g. 1 day, 1 week, Up to 1 month' },
          { name: 'days', label: 'Up to (days)', type: 'number', min: 1 },
          { name: 'amount', label: 'Price', type: 'number', step: 0.01, min: 0 },
        ],
      },
      { name: 'requiresApproval', label: 'Ads need admin approval before they go live (listing plans)', type: 'checkbox' },
      { name: 'addressRequired', label: 'Street address required (listing plans)', type: 'checkbox' },
      { name: 'published', label: 'Show on the public site', type: 'checkbox' },
    ],
  },
  subscribers: {
    title: 'Subscribers',
    singular: 'Subscriber',
    publicPath: '/map',
    hasSlug: false,
    searchKeys: ['name', 'category', 'city', 'email'],
    columns: [
      { key: 'name', label: 'Business' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'city', label: 'City' },
    ],
    fields: [
      { name: 'name', label: 'Business name', type: 'text', required: true, max: 120 },
      { name: 'category', label: 'Category', type: 'reference', resource: 'categories', emptyLabel: 'Not set' },
      { name: 'plan', label: 'Pricing plan', type: 'reference', resource: 'plans', emptyLabel: 'Default — connection fee' },
      { name: 'status', label: 'Subscription status', type: 'select', options: SUBSCRIBER_STATUSES, help: 'New tasker sign-ups arrive as pending. Only active and trial subscribers appear on the public site and map.' },
      { name: 'subServices', label: 'Skills — sub-service slugs (one per line)', type: 'lines', help: 'Which sub-services of the category they offer, e.g. car-detailing.' },
      { name: 'address', label: 'Street address (private)', type: 'text', max: 200 },
      { name: 'city', label: 'City', type: 'text', max: 80 },
      { name: 'region', label: 'Province / state', type: 'text', max: 40, help: 'e.g. ON, BC, NY' },
      { name: 'postalCode', label: 'Postal code (private)', type: 'text', max: 20 },
      { name: 'country', label: 'Country', type: 'text', max: 60 },
      { name: 'location', label: 'Map location', type: 'location', help: 'Filled in automatically from the address when left empty. Click the map to move it — the public map rounds it to about 1 km.' },
      { name: 'contactName', label: 'Contact name (private)', type: 'text', max: 120 },
      { name: 'email', label: 'Email (private)', type: 'text', max: 200 },
      { name: 'phone', label: 'Phone (private)', type: 'text', max: 40 },
      {
        name: 'hours',
        label: 'Availability',
        type: 'repeater',
        itemLabel: 'Day',
        fields: [
          { name: 'day', label: 'Day', type: 'text', max: 12 },
          { name: 'start', label: 'Start', type: 'text', max: 5, help: '24h, e.g. 10:00' },
          { name: 'end', label: 'End', type: 'text', max: 5, help: '24h, e.g. 18:00' },
          { name: 'closed', label: 'Closed', type: 'checkbox' },
        ],
      },
      { name: 'notes', label: 'Internal notes', type: 'textarea', rows: 3 },
      { name: 'published', label: 'Show on the public site and map', type: 'checkbox' },
    ],
  },
  listings: {
    title: 'Ads',
    singular: 'Ad',
    publicPath: '/#services',
    hasSlug: false,
    searchKeys: ['title', 'category', 'city', 'email', 'status'],
    columns: [
      { key: 'title', label: 'Ad' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'endDate', label: 'Ends' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 120 },
      { name: 'category', label: 'Category', type: 'reference', resource: 'categories', emptyLabel: 'Not set' },
      { name: 'status', label: 'Status', type: 'select', options: LISTING_STATUSES, help: 'Set a free ad to published to put it live — the poster is emailed. Paid ads publish themselves once paid.' },
      { name: 'startDate', label: 'Starts (YYYY-MM-DD)', type: 'text', required: true, max: 10 },
      { name: 'endDate', label: 'Ends (YYYY-MM-DD)', type: 'text', required: true, max: 10, help: 'The ad disappears from the site after this day.' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 5, max: 3000 },
      { name: 'photo', label: 'Photo', type: 'image' },
      { name: 'address', label: 'Street address', type: 'text', max: 200 },
      { name: 'city', label: 'City', type: 'text', max: 80 },
      { name: 'region', label: 'Province / state', type: 'text', max: 60 },
      { name: 'postalCode', label: 'Postal code', type: 'text', max: 20 },
      { name: 'country', label: 'Country', type: 'text', max: 60 },
      { name: 'contactName', label: 'Contact name', type: 'text', max: 120 },
      { name: 'email', label: 'Email (private)', type: 'text', max: 200 },
      { name: 'phone', label: 'Phone (shown on the ad)', type: 'text', max: 40 },
      { name: 'amount', label: 'Amount charged', type: 'number', step: 0.01, min: 0 },
      { name: 'paymentRef', label: 'Stripe payment reference', type: 'text', max: 200 },
      { name: 'notes', label: 'Internal notes', type: 'textarea', rows: 3 },
      { name: 'published', label: 'Visible (untick to hide without changing the status)', type: 'checkbox' },
    ],
  },
} satisfies Record<string, ResourceDef>

export type ResourceKey = keyof typeof RESOURCE_DEFS
export const isResourceKey = (k: string): k is ResourceKey => k in RESOURCE_DEFS
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
