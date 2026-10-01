import { seoFields, type FieldSpec } from './fields'

const titleBody = (itemLabel: string): FieldSpec => ({
  name: 'items',
  label: itemLabel,
  type: 'repeater',
  itemLabel,
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'body', label: 'Body', type: 'textarea', rows: 3 },
  ],
})

const heroImageField: FieldSpec = { name: 'heroImage', label: 'Hero background image', type: 'image', help: 'Full-bleed photo behind the page header. Landscape, 2000px+ wide.' }

const legalFields: FieldSpec[] = [
  { name: 'title', label: 'Page title', type: 'text', required: true },
  heroImageField,
  { name: 'effectiveDate', label: 'Effective date', type: 'text', help: 'e.g. March 17, 2026' },
  { name: 'intro', label: 'Introduction', type: 'textarea', rows: 4 },
  {
    name: 'sections',
    label: 'Sections',
    type: 'repeater',
    itemLabel: 'Section',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'body', label: 'Body', type: 'textarea', rows: 8, help: 'Blank line = new paragraph. Start a line with "- " for a bullet.' },
    ],
  },
  ...seoFields,
]

const indexPage: FieldSpec[] = [
  { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
  { name: 'heading', label: 'Heading', type: 'text', required: true },
  { name: 'body', label: 'Intro copy', type: 'textarea', rows: 3 },
  heroImageField,
  ...seoFields,
]

export type ContentDef = {
  title: string
  section: 'Pages' | 'Pricing' | 'Legal' | 'Settings'
  /** Public page this content renders on (used for “View on site”). Saves revalidate the whole site. */
  path: string
  fields: FieldSpec[]
}

export const CONTENT_DEFS = {
  home: {
    title: 'Home page',
    section: 'Pages',
    path: '/',
    fields: [
      { name: 'heroEyebrow', label: 'Hero eyebrow', type: 'text' },
      { name: 'heroHeading', label: 'Hero heading', type: 'text', required: true, help: 'Use | to choose where the line breaks and *asterisks* around words to set them in the serif accent.' },
      { name: 'heroBody', label: 'Hero supporting copy', type: 'textarea', rows: 3 },
      { name: 'primaryCta', label: 'Primary CTA label', type: 'text' },
      { name: 'secondaryCta', label: 'Secondary CTA label', type: 'text' },
      { name: 'heroImage', label: 'Hero background image', type: 'image', help: 'Full-bleed photo behind the hero. Landscape, 2400px+ wide.' },
      { name: 'heroImageAlt', label: 'Hero image alt text', type: 'text' },
      { name: 'customersTitle', label: 'Customers panel title', type: 'text' },
      { name: 'customersBody', label: 'Customers panel copy', type: 'textarea', rows: 3 },
      { name: 'customersImage', label: 'Customers panel image', type: 'image' },
      { name: 'providersTitle', label: 'Providers panel title', type: 'text' },
      { name: 'providersBody', label: 'Providers panel copy', type: 'textarea', rows: 3 },
      { name: 'providersImage', label: 'Providers panel image', type: 'image' },
      { name: 'statement', label: 'Statement (large type section)', type: 'textarea', rows: 3 },
      { name: 'finalTitle', label: 'Closing CTA heading', type: 'text' },
      { name: 'finalBody', label: 'Closing CTA copy', type: 'textarea', rows: 2 },
      ...seoFields,
    ],
  },
  about: {
    title: 'About page',
    section: 'Pages',
    path: '/about',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'intro', label: 'Introduction', type: 'textarea', rows: 4 },
      { name: 'image', label: 'Lead image', type: 'image' },
      { name: 'problemTitle', label: 'Problem — title', type: 'text' },
      { name: 'problemBody', label: 'Problem — copy', type: 'textarea', rows: 5 },
      { name: 'approachTitle', label: 'Approach — title', type: 'text' },
      { name: 'approachBody', label: 'Approach — copy', type: 'textarea', rows: 5 },
      { ...titleBody('Principle'), name: 'principles', label: 'Principles' },
      { name: 'secondaryImage', label: 'Secondary image', type: 'image' },
      { name: 'visionTitle', label: 'Vision — title', type: 'text' },
      { name: 'visionBody', label: 'Vision — copy', type: 'textarea', rows: 5 },
      ...seoFields,
    ],
  },
  howItWorks: {
    title: 'How It Works page',
    section: 'Pages',
    path: '/how-it-works',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'body', label: 'Intro copy', type: 'textarea', rows: 3 },
      heroImageField,
      {
        name: 'stages',
        label: 'Journey stages',
        type: 'repeater',
        itemLabel: 'Stage',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'body', label: 'Body', type: 'textarea', rows: 3 },
          { name: 'detail', label: 'Detail line', type: 'text' },
        ],
      },
      ...seoFields,
    ],
  },
  providers: {
    title: 'For Service Providers page',
    section: 'Pages',
    path: '/for-providers',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'body', label: 'Intro copy', type: 'textarea', rows: 3 },
      { name: 'image', label: 'Hero image', type: 'image' },
      { ...titleBody('Benefit'), name: 'benefits', label: 'Benefits' },
      { ...titleBody('Step'), name: 'steps', label: 'Listing steps' },
      { name: 'formTitle', label: 'Listing form title', type: 'text' },
      { name: 'formBody', label: 'Listing form copy', type: 'textarea', rows: 2 },
      ...seoFields,
    ],
  },
  customers: {
    title: 'For Customers page',
    section: 'Pages',
    path: '/for-customers',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'body', label: 'Intro copy', type: 'textarea', rows: 3 },
      { name: 'image', label: 'Hero image', type: 'image' },
      { ...titleBody('Step'), name: 'steps', label: 'Journey (Search → Compare → Choose → Connect)' },
      { ...titleBody('Assurance'), name: 'assurances', label: 'Assurances' },
      ...seoFields,
    ],
  },
  servicesPage: { title: 'Services index', section: 'Pages', path: '/services', fields: indexPage },
  citiesPage: { title: 'Areas served index', section: 'Pages', path: '/cities', fields: indexPage },
  faqPage: { title: 'FAQ page', section: 'Pages', path: '/faq', fields: indexPage },
  contactPage: { title: 'Contact page', section: 'Pages', path: '/contact', fields: indexPage },
  pricing: {
    title: 'Pricing',
    section: 'Pricing',
    path: '/pricing',
    fields: [
      { name: 'amount', label: 'Price', type: 'number', step: 0.01, min: 0 },
      { name: 'currency', label: 'Currency code', type: 'text', max: 3, help: 'ISO code such as CAD or USD. Leave blank to show the amount only.' },
      { name: 'unit', label: 'Price unit', type: 'text', help: 'e.g. “per provider connection”' },
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'body', label: 'Intro copy', type: 'textarea', rows: 3 },
      heroImageField,
      { name: 'includes', label: 'What is included (one per line)', type: 'lines' },
      { ...titleBody('Step'), name: 'steps', label: 'How the fee works' },
      { name: 'note', label: 'Fine print', type: 'textarea', rows: 2 },
      { name: 'providerTitle', label: 'Provider advertising — title', type: 'text' },
      { name: 'providerBody', label: 'Provider advertising — copy', type: 'textarea', rows: 3 },
      ...seoFields,
    ],
  },
  privacy: { title: 'Privacy Policy', section: 'Legal', path: '/privacy', fields: legalFields },
  terms: { title: 'Terms & Conditions', section: 'Legal', path: '/terms', fields: legalFields },
  site: {
    title: 'Site settings',
    section: 'Settings',
    path: '/',
    fields: [
      { name: 'name', label: 'Site name', type: 'text', required: true },
      { name: 'tagline', label: 'Tagline', type: 'text' },
      { name: 'contactEmail', label: 'Public contact email', type: 'text', required: true },
      { name: 'notifyEmail', label: 'Lead notification email', type: 'text', help: 'Where new form submissions are emailed (requires SMTP settings).' },
      { name: 'phone', label: 'Public phone (optional)', type: 'text' },
      { name: 'footerStatement', label: 'Footer statement', type: 'textarea', rows: 2 },
      { name: 'facebook', label: 'Facebook URL', type: 'text' },
      { name: 'instagram', label: 'Instagram URL', type: 'text' },
      { name: 'youtube', label: 'YouTube URL', type: 'text' },
      { name: 'tiktok', label: 'TikTok URL', type: 'text' },
      { name: 'whatsapp', label: 'WhatsApp channel URL', type: 'text' },
    ],
  },
  seo: {
    title: 'SEO defaults',
    section: 'Settings',
    path: '/',
    fields: [
      { name: 'defaultTitle', label: 'Default title', type: 'text', required: true },
      { name: 'defaultDescription', label: 'Default description', type: 'textarea', rows: 2, max: 320 },
      { name: 'keywords', label: 'Keywords (one per line)', type: 'lines' },
      { name: 'ogImage', label: 'Default social sharing image', type: 'image', help: '1200×630 recommended. Leave blank to use the generated brand image.' },
      { name: 'twitterHandle', label: 'X / Twitter handle', type: 'text', help: 'e.g. @fleeket' },
    ],
  },
} satisfies Record<string, ContentDef>

export type ContentKey = keyof typeof CONTENT_DEFS
export const CONTENT_KEYS = Object.keys(CONTENT_DEFS) as ContentKey[]
export const isContentKey = (k: string): k is ContentKey => k in CONTENT_DEFS
