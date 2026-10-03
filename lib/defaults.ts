/**
 * Initial content. Seeded into MongoDB once (see lib/content.ts → ensureSeeded) and then owned by the admin.
 * Also served read-only when MONGODB_URI is not configured, so the public site always renders.
 */

import { LIVE_CATEGORIES } from './live-catalog'

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=2000`
/** Images hosted by the live fleeket.com — move them into Admin → Media library before the old site is retired. */
const live = (path: string) => `https://www.fleeket.com/${path}`

export type FaqPair = { q: string; a: string }

export type SubServiceSeed = { name: string; slug: string; description: string; image: string; legacyId?: number }

export type CategorySeed = {
  name: string
  slug: string
  legacyId?: number
  group: string
  icon: string
  description: string
  image: string
  imageAlt: string
  subServices: SubServiceSeed[]
}

/** The live fleeket.com catalogue (see lib/live-catalog.ts). */
export const DEFAULT_CATEGORIES: CategorySeed[] = LIVE_CATEGORIES

/**
 * The 3 listing categories the client confirmed (Oct 2026): people post an ad for a set time instead of
 * subscribing as a tasker. Each uses a `listing` plan — price by how long the ad runs — editable in Admin → Pricing plans.
 */
export const LISTING_PLANS = [
  {
    name: 'Open house ad',
    slug: 'open-house',
    billing: 'listing',
    amount: 9.99,
    currency: 'CAD',
    payer: 'provider',
    summary: 'One house address per ad, live for as long as you choose — up to one month. Selling several houses? Post one ad per address.',
    includes: ['House address and photo', 'Open house dates', 'Your contact number'],
    durations: [{ label: 'Up to 1 month', days: 30, amount: 9.99 }],
    requiresApproval: false,
    addressRequired: true,
    published: true,
  },
  {
    name: 'Garage sale ad',
    slug: 'garage-sale',
    billing: 'listing',
    amount: 9.99,
    currency: 'CAD',
    payer: 'provider',
    summary: 'Run your garage sale ad for a day, a week or the full month — never more than $9.99.',
    includes: ['Sale address and photo', 'Sale dates', 'Your contact number'],
    // ponytail: day and week prices are placeholders until the client confirms them (Admin → Pricing plans).
    durations: [
      { label: '1 day', days: 1, amount: 2.99 },
      { label: '1 week', days: 7, amount: 5.99 },
      { label: '1 month', days: 30, amount: 9.99 },
    ],
    requiresApproval: false,
    addressRequired: true,
    published: true,
  },
  {
    name: 'Free ad',
    slug: 'free-ad',
    billing: 'listing',
    amount: 0,
    currency: 'CAD',
    payer: 'customer',
    summary: 'Post a lost pet or anything else for free. Our team checks every ad before it goes live.',
    includes: ['Photo and description', 'Live for up to one month', 'Reviewed by our team'],
    durations: [{ label: 'Up to 1 month', days: 30, amount: 0 }],
    requiresApproval: true,
    addressRequired: false,
    published: true,
  },
]

export const LISTING_CATEGORIES: (CategorySeed & { plan: string })[] = [
  {
    name: 'Open House - Realtors',
    slug: 'open-house',
    group: 'Home & Property',
    icon: 'home',
    description: 'Realtors: advertise your open house. One ad per house address, live for the dates you choose — up to one month for $9.99.',
    image: img('photo-1568605114967-8130f3a36994'),
    imageAlt: 'House for sale at dusk',
    subServices: [],
    plan: 'open-house',
  },
  {
    name: 'Garage Sale',
    slug: 'garage-sale',
    group: 'Business & Local',
    icon: 'tag',
    description: 'Tell your neighbours about your garage sale. Run your ad for a day, a week or the whole month — $9.99 maximum.',
    image: img('photo-1556905055-8f358a7a47b2'),
    imageAlt: 'Second-hand clothes laid out for sale',
    subServices: [],
    plan: 'garage-sale',
  },
  {
    name: 'Free Ads - Lost Pets & More',
    slug: 'free-ads',
    group: 'Business & Local',
    icon: 'heart',
    description: 'Lost a pet? Giving something away? Post a free ad. Every ad is checked by our team before it goes live.',
    image: img('photo-1543466835-00a7907e9de1'),
    imageAlt: 'A beagle looking at the camera',
    subServices: [],
    plan: 'free-ad',
  },
]

type CitySeed = { name: string; slug: string; kind: 'province' | 'territory'; regionCode: string; description: string; image?: string }

const province = (name: string, regionCode: string, kind: 'province' | 'territory' = 'province', image = ''): CitySeed => ({
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  kind,
  regionCode,
  image,
  description: `Discover service providers advertising across ${name} — from home and property services to automotive, family, wellness and local business categories. Search by what you need, compare listings and connect directly with the providers that fit.`,
})

export const DEFAULT_CITIES: CitySeed[] = [
  province('Alberta', 'AB'),
  province('British Columbia', 'BC', 'province', img('photo-1730661906876-18bfc6e95f2f')),
  province('Manitoba', 'MB'),
  province('New Brunswick', 'NB'),
  province('Newfoundland and Labrador', 'NL'),
  province('Nova Scotia', 'NS'),
  province('Ontario', 'ON', 'province', img('photo-1486325212027-8081e485255e')),
  province('Prince Edward Island', 'PE'),
  province('Quebec', 'QC'),
  province('Saskatchewan', 'SK'),
  province('Northwest Territories', 'NT', 'territory'),
  province('Nunavut', 'NU', 'territory'),
  province('Yukon', 'YT', 'territory'),
]

export const DEFAULT_FAQS: { question: string; answer: string; topic: string }[] = [
  {
    topic: 'General',
    question: 'What is Fleeket and how does it work?',
    answer:
      'Fleeket connects people who need a service with the taskers who provide it. Browse the service categories, choose the tasker that fits your job, and once your request is confirmed their contact details are sent straight to your email so you can arrange the work directly.',
  },
  {
    topic: 'General',
    question: 'How do I sign up for Fleeket?',
    answer:
      'Select “Be Our Member” to create a customer account, or “Become A Tasker” if you offer a service. Fill in your details, accept the Terms & Conditions and your account is ready.',
  },
  {
    topic: 'Customers',
    question: 'How do I select a Service Provider?',
    answer:
      'Open the category you need, choose the specific service, and review the taskers available for it. Pick the one that suits your job and confirm your request.',
  },
  {
    topic: 'Pricing & payments',
    question: 'Is my payment secure on Fleeket?',
    answer:
      'Payments are processed by Stripe, a third-party payment provider, over encrypted connections. Fleeket never sees or stores your full card details. Questions about a charge? Email fleeket@outlook.com.',
  },
]

const legal = (title: string, intro: string, sections: { heading: string; body: string }[], seoDescription: string) => ({
  title,
  effectiveDate: 'March 17, 2026',
  intro,
  sections,
  seoTitle: title,
  seoDescription,
})

export const DEFAULT_CONTENT = {
  home: {
    slides: [
      { image: live('assets/images/main-swiper/slide_04.jpeg'), heading: 'Seamless Solutions, Endless Possibilities, Fleeket' },
      { image: live('assets/images/main-swiper/slide_01.jpeg'), heading: 'Fleeket Connecting Needs With Expert Deeds. Where Services Shine And Solutions Align' },
      { image: live('assets/images/main-swiper/slide_02.jpeg'), heading: 'Where Tasks Meet Talent, Effortlessly' },
      { image: live('assets/images/main-swiper/slide_03.jpeg'), heading: 'From Idea To Reality, Fleeket Makes It Happen' },
    ],
    servicesHeading: 'Fleeket Services',
    stepsHeading: 'Effortless Task Management, Your Journey With Fleeket',
    steps: [
      { title: 'Step A: Start Your Journey', body: 'Create your Fleeket account in just a few simple steps. Click on the “Sign Up” button, fill in your details, and voila! You’re one step closer to accessing a world of reliable services at your fingertips.' },
      { title: 'Step B: Explore Your Options', body: 'Once your account is set up, dive into Fleeket’s diverse range of services. Whether it’s home repairs, cleaning, or something more specialized, our intuitive search and browsing features make finding the perfect tasker a breeze.' },
      { title: 'Step C: Make Your Choice', body: 'Found the right tasker for the job? Fantastic! Proceed with confidence — Fleeket offers secure and seamless payment options, ensuring a hassle-free transaction. Once confirmed, sit back and relax knowing your tasker information and contact is on the way.' },
      { title: 'Step D: Sit Back and Relax', body: 'After confirmation, expect an email with all the details you need. Your tasker’s contact information and any other relevant information will be sent directly to your inbox. Now, all that’s left to do is sit back, relax and contact the service provider at your convenience.' },
    ],
    faqHeading: 'Answers To Your Questions: Frequently Asked Questions',
    faqBannerImage: live('media/FAQsphoto-WSZFJLRZ.jpg'),
    faqBannerTitle: 'Have Any Question?',
    faqBannerBody: 'Submit your question and receive an answer from us',
    seoTitle: 'Fleeket | Find trusted local taskers',
    seoDescription: 'Fleeket connects needs with expert deeds — find trusted local taskers for automotive, cleaning, moving, renovation, tutoring, pet services and more.',
  },
  about: {
    title: 'Who Are We?',
    subtitle: 'Connecting service providers with anyone in need of the service',
    intro:
      'Welcome to our company bio! At Fleeket, we are dedicated to providing a seamless connection between service providers and anyone in need of their services. With our extensive network of professionals and expertise in the industry, we strive to simplify the process of finding the right service provider for your needs.',
    image: live('assets/images/toronto-canada.jpg'),
    missionTitle: 'Our Mission',
    missionBody:
      'Our primary goal is to simplify the service provider selection process. We understand that finding a reliable and trustworthy service provider can be a daunting task, especially when it comes to important tasks such as home improvement, car repairs, or precious time photography. By connecting service providers with those in need, we aim to provide a convenient and efficient solution, saving you time and effort.',
    missionImage1: live('assets/images/main-swiper/slide_01.jpeg'),
    missionImage2: live('assets/images/main-swiper/slide_02.jpeg'),
    missionImage3: live('assets/images/main-swiper/slide_03.jpeg'),
    missionImage4: live('assets/images/main-swiper/slide_04.jpeg'),
    networkTitle: 'Our Network',
    networkBody:
      'To ensure quality and reliability, we carefully screen and vet each service provider in our network. We prioritize professionalism and customer satisfaction, ensuring that you receive the best possible service. By choosing us, you can have peace of mind knowing that you are dealing with experienced professionals who are committed to meeting your needs.',
    networkImage: live('assets/images/section-bg-01.jpg'),
    seoTitle: 'Who Are We? | Fleeket',
    seoDescription: 'Fleeket connects service providers with anyone in need of the service. Learn about our mission and our network of professionals.',
  },
  contactPage: {
    heading: 'Get In Touch: Contact Us',
    body: 'If you are ready to provide a service or connect with a service provider, please do not hesitate to become one of our Fleeketee/Fleeketer. Our team is always ready to assist you and answer any questions you may have. Together, let’s simplify the service provider selection process and make finding the right professional easier than ever before!',
    formTitle: 'Use the contact form to get in touch or email us at fleeket@outlook.com. We’ll get back to you asap.',
    formSubtitle: 'Want to know more about our platform?',
    seoTitle: 'Contact Us | Fleeket',
    seoDescription: 'Get in touch with Fleeket — questions about finding a tasker, becoming a tasker or your account.',
  },
  taskerPage: {
    heading: 'Become a Tasker',
    body: 'Ready to showcase your skills and grow your business? Join Fleeket as a tasker today! Create your profile, and start connecting with clients in your area. Take the next step towards success – sign up now!',
    image: live('assets/images/BecomeATasker.jpg'),
    skillsTitle: 'Skills',
    skillsBody: 'Expand your opportunities and showcase your diverse skills on Fleeket! Reach more clients and maximize your earning potential. Join now to unlock the power of multi-skilling – let’s make every task count!',
    hoursTitle: 'Availability time',
    hoursBody: 'Set main business hours or mark your business as closed.',
    seoTitle: 'Become a Tasker | Fleeket',
    seoDescription: 'Join Fleeket as a tasker: create your profile, choose your skills and start connecting with clients in your area.',
  },
  memberPage: {
    heading: 'Create An Account',
    body: 'Welcome to Fleeket! Get started now to find the perfect tasker for your needs. Browse our skilled professionals, compare their profiles, and make your selection. Your hassle-free solution is just a click away – sign up today!',
    image: live('assets/images/BeOurMember.jpg'),
    seoTitle: 'Be Our Member | Fleeket',
    seoDescription: 'Create your free Fleeket account to find the perfect tasker for your needs.',
  },
  offers: {
    title: 'Advertising Area',
    subtitle: 'Fleeket Offers',
    body: '',
  },
  pricing: {
    amount: 9.99,
    currency: '',
    unit: 'per provider connection',
    eyebrow: 'Pricing',
    heading: 'One fair price. Nothing hidden.',
    body: 'Browsing Fleeket is free. When you’ve found the provider you want, unlock their contact details for a single flat fee.',
    includes: [
      'The provider’s direct contact details',
      'Delivered to your email immediately after payment',
      'Contact the provider on your own schedule',
      'Secure checkout through a third-party payment processor',
      'Support from the Fleeket team if something isn’t right',
    ],
    steps: [
      { title: 'Browse for free', body: 'Search categories and compare providers in your area without paying a cent.' },
      { title: 'Choose your provider', body: 'When you’re ready, select the provider you want to connect with.' },
      { title: 'Pay once, connect directly', body: 'Pay the flat fee and receive their contact details by email.' },
    ],
    note: 'The connection fee covers delivery of the provider’s contact details. Any work you arrange is quoted and paid directly to the provider. Applicable taxes may apply.',
    providerTitle: 'Advertising your service?',
    providerBody: 'Provider listings are arranged with our team. Tell us about your business and we’ll walk you through the options.',
    seoTitle: 'Pricing — One flat fee per connection | Fleeket',
    seoDescription: 'Browse Fleeket for free and connect with a service provider for one flat fee of $9.99. No subscriptions or hidden costs.',
  },
  privacy: legal(
    'Privacy Policy',
    'Fleeket.com (“Fleeket,” “we,” “us”) is committed to protecting your privacy while providing advertising and service-discovery services. This policy explains how we collect, use, share and protect your personal information when you use Fleeket.com and related services (the “Service”).',
    [
      {
        heading: 'Scope of this policy',
        body: 'This policy applies to personal information you provide through our websites, applications and communications, including phone, chat, SMS and email.\n\nWe collect, store and process information to:\n- Provide and improve the Service\n- Personalise your experience\n- Deliver and measure advertising\n- Communicate with you\n- Maintain security, backups and legal compliance',
      },
      {
        heading: 'Information you provide',
        body: '- Account information: name, email, phone number, address and preferences.\n- Business information: business name, address and professional background, if you represent a business.\n- Communications: messages sent through the Service, including timestamps and delivery status.\n- Transactions: payment and transaction information related to connections or services.\n- Optional information you choose to share, such as location.',
      },
      {
        heading: 'Information from your use of the Service',
        body: '- Activity data such as searches and page views\n- Device data such as IP address, browser, device type and operating system\n- Cookies and similar technologies, subject to your consent preferences',
      },
      {
        heading: 'How we use your information',
        body: '- To operate, personalise and improve the Service\n- To deliver and measure advertising and analytics\n- To communicate with you and respond to requests\n- To protect the Service and prevent fraud\n- To understand how the Service is used',
      },
      {
        heading: 'How we share your information',
        body: '- Service providers who help us operate, such as payment processors, analytics, hosting and email delivery\n- Advertisers and businesses, using de-identified or aggregated data only\n- Third-party platforms when you direct us to\n- Successors in a business transfer\n- Authorities where required by law or to protect rights and safety',
      },
      {
        heading: 'Cookies and consent',
        body: 'We use essential cookies to operate the Service and keep it secure. With your consent, we may also use analytics cookies to understand performance and advertising cookies to measure campaigns. You can accept or reject non-essential cookies using the consent banner and change your choice at any time from the “Cookie preferences” link in the footer.',
      },
      {
        heading: 'Your choices and rights',
        body: 'You can update your account details, request a copy or deletion of your personal information, or close your account by contacting us. Depending on where you live, you may have additional rights under applicable privacy laws. We may verify your identity before responding.\n\nFleeket does not knowingly collect information from anyone under 13, or the applicable age of consent where you live.',
      },
      {
        heading: 'Security',
        body: 'We use commercially reasonable measures to protect personal information. No method of electronic transmission or storage is completely secure, and we cannot guarantee absolute security.',
      },
      {
        heading: 'Contact us',
        body: 'For privacy questions or requests, email fleeket@outlook.com.',
      },
      {
        heading: 'Changes to this policy',
        body: 'We may update this policy from time to time. Material changes will be communicated by email or a notice on the website. Continued use of the Service after changes take effect constitutes acceptance.',
      },
    ],
    'How Fleeket collects, uses, shares and protects your personal information, and the choices you have.',
  ),
  terms: legal(
    'Terms & Conditions',
    'These Terms & Conditions govern your use of Fleeket.com and related services (the “Service”). By accessing or using the Service, you agree to these terms.',
    [
      { heading: 'Eligibility', body: '- Users must be at least 13 years old, or older where required by local law.\n- Advertisers and service providers must be legally authorised to offer their services.' },
      { heading: 'The Fleeket service', body: 'Fleeket is a digital advertising and service-discovery platform. We help customers discover service providers and help providers advertise their services. Agreements for work are made directly between customers and providers; Fleeket is not a party to those agreements.' },
      { heading: 'Your responsibilities', body: '- Provide accurate information\n- Comply with applicable laws\n- Do not post illegal, misleading or harmful content\n- Do your own due diligence before engaging a provider' },
      { heading: 'Intellectual property', body: 'Fleeket owns the content, logos and trademarks of the Service. Unauthorised use is prohibited.' },
      { heading: 'User content', body: 'You retain ownership of content you submit but grant Fleeket a licence to use it to operate and promote the Service. Fleeket may remove content at its discretion.' },
      { heading: 'Third-party links and providers', body: 'Fleeket is not responsible for external websites, advertisers or the services provided by third parties. Interactions with providers are at your own risk.' },
      { heading: 'Payments and billing', body: 'Fees are payable as stated at the time of purchase. Connection fees cover delivery of a provider’s contact details. Non-payment may result in suspension of access.' },
      { heading: 'Disclaimers and limitation of liability', body: 'The Service is provided “as is” and “as available.” To the extent permitted by law, Fleeket is not liable for indirect, incidental or consequential damages, loss of data or profits, or the actions of third parties.' },
      { heading: 'Indemnification', body: 'You agree to indemnify Fleeket for claims arising from your use of the Service or violation of these terms.' },
      { heading: 'Termination', body: 'Fleeket may suspend or terminate access to the Service at any time where these terms are breached or as required to protect the Service or its users.' },
      { heading: 'Governing law', body: 'These terms are governed by the laws of the jurisdiction in which Fleeket operates, unless local law requires otherwise.' },
      { heading: 'Changes', body: 'Fleeket may update these terms from time to time. Continued use of the Service after changes take effect constitutes acceptance.' },
      { heading: 'Contact', body: 'Questions about these terms? Email fleeket@outlook.com.' },
    ],
    'The terms that govern your use of Fleeket, the digital advertising and service-discovery platform.',
  ),
  site: {
    name: 'Fleeket',
    tagline: 'Connecting needs with expert deeds',
    contactEmail: 'fleeket@outlook.com',
    notifyEmail: 'fleeket@outlook.com',
    phone: '',
    footerStatement: 'We are dedicated to providing a seamless connection between service providers and anyone in need of their services. With our extensive network of professionals and expertise in the industry, we strive to simplify the process of finding the right service provider for your needs.',
    facebook: 'https://www.facebook.com/share/18SDHguCMb/',
    instagram: 'https://www.instagram.com/fleeket',
    youtube: 'https://youtube.com/@fleeket',
    tiktok: 'https://www.tiktok.com/@fleeket',
    whatsapp: 'https://www.whatsapp.com/channel/0029VaJnomn90x2pWilgIi16',
  },
  seo: {
    defaultTitle: 'Fleeket — Connecting needs with expert deeds',
    defaultDescription:
      'Fleeket connects people looking for services with professionals ready to deliver — across Canada and the United States.',
    keywords: ['local services', 'service providers', 'find a contractor', 'cleaning services', 'moving services', 'tutoring', 'advertise my business', 'Canada', 'United States'],
    ogImage: '',
    twitterHandle: '',
  },
}

export type DefaultContent = typeof DEFAULT_CONTENT
