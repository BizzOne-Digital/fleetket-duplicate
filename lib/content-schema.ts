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

const legalFields: FieldSpec[] = [
  { name: 'title', label: 'Page title', type: 'text', required: true },
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
      {
        name: 'slides',
        label: 'Hero slides',
        type: 'repeater',
        itemLabel: 'Slide',
        help: 'The slider at the top of the home page. Slides rotate every few seconds.',
        fields: [
          { name: 'image', label: 'Image', type: 'image' },
          { name: 'heading', label: 'Heading', type: 'text', required: true },
        ],
      },
      { name: 'servicesHeading', label: 'Services heading', type: 'text' },
      { name: 'stepsHeading', label: 'Steps heading', type: 'text' },
      { ...titleBody('Step'), name: 'steps', label: 'Steps (A–D)' },
      { name: 'faqHeading', label: 'FAQ heading', type: 'text' },
      { name: 'faqBannerImage', label: 'FAQ banner image', type: 'image' },
      { name: 'faqBannerTitle', label: 'FAQ banner title', type: 'text' },
      { name: 'faqBannerBody', label: 'FAQ banner text', type: 'text' },
      ...seoFields,
    ],
  },
  about: {
    title: 'Who Are We?',
    section: 'Pages',
    path: '/about',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'intro', label: 'Introduction', type: 'textarea', rows: 4 },
      { name: 'image', label: 'Wide image', type: 'image' },
      { name: 'missionTitle', label: 'Mission — title', type: 'text' },
      { name: 'missionBody', label: 'Mission — text', type: 'textarea', rows: 5 },
      { name: 'missionImage1', label: 'Mission image 1', type: 'image' },
      { name: 'missionImage2', label: 'Mission image 2', type: 'image' },
      { name: 'missionImage3', label: 'Mission image 3', type: 'image' },
      { name: 'missionImage4', label: 'Mission image 4', type: 'image' },
      { name: 'networkTitle', label: 'Network — title', type: 'text' },
      { name: 'networkBody', label: 'Network — text', type: 'textarea', rows: 5 },
      { name: 'networkImage', label: 'Network image', type: 'image' },
      ...seoFields,
    ],
  },
  contactPage: {
    title: 'Contact Us',
    section: 'Pages',
    path: '/contact',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'body', label: 'Intro text', type: 'textarea', rows: 4 },
      { name: 'formTitle', label: 'Form title', type: 'textarea', rows: 2 },
      { name: 'formSubtitle', label: 'Form subtitle', type: 'text' },
      ...seoFields,
    ],
  },
  taskerPage: {
    title: 'Become a Tasker',
    section: 'Pages',
    path: '/become-a-tasker',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'body', label: 'Intro text', type: 'textarea', rows: 3 },
      { name: 'image', label: 'Side image', type: 'image' },
      { name: 'skillsTitle', label: 'Skills — title', type: 'text' },
      { name: 'skillsBody', label: 'Skills — text', type: 'textarea', rows: 3 },
      { name: 'hoursTitle', label: 'Availability — title', type: 'text' },
      { name: 'hoursBody', label: 'Availability — text', type: 'text' },
      ...seoFields,
    ],
  },
  memberPage: {
    title: 'Be Our Member',
    section: 'Pages',
    path: '/register',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'body', label: 'Intro text', type: 'textarea', rows: 3 },
      { name: 'image', label: 'Side image', type: 'image' },
      ...seoFields,
    ],
  },
  offers: {
    title: 'Category offers banner',
    section: 'Pages',
    path: '/',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'body', label: 'Offer text', type: 'textarea', rows: 3, help: 'Shown on every category page. A category on a pricing plan shows that plan here instead.' },
    ],
  },
  pricing: {
    title: 'Connection fee',
    section: 'Pricing',
    path: '/',
    fields: [
      { name: 'amount', label: 'Fee', type: 'number', step: 0.01, min: 0, help: 'The default fee for categories without their own pricing plan.' },
      { name: 'currency', label: 'Currency code', type: 'text', max: 3, help: 'ISO code such as CAD or USD. Leave blank to show the amount only.' },
      { name: 'unit', label: 'Fee unit', type: 'text', help: 'e.g. “per provider connection”' },
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
