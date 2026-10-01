/**
 * Initial content. Seeded into MongoDB once (see lib/content.ts → ensureSeeded) and then owned by the admin.
 * Also served read-only when MONGODB_URI is not configured, so the public site always renders.
 */

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=2000`

export type FaqPair = { q: string; a: string }

export type CategorySeed = {
  name: string
  slug: string
  group: string
  icon: string
  shortDescription: string
  description: string
  image: string
  imageAlt: string
  needs: string[]
  serviceTypes: string[]
  faqs: FaqPair[]
  featured?: boolean
}

const c = (s: CategorySeed) => s

export const DEFAULT_CATEGORIES: CategorySeed[] = [
  c({
    name: 'Cleaning & Housekeeping',
    slug: 'cleaning',
    group: 'Home & Property',
    icon: 'spray-can',
    featured: true,
    shortDescription: 'Regular housekeeping, deep cleans and move-out cleaning from local professionals.',
    description:
      'A clean home or workplace shouldn’t take over your weekend. Fleeket helps you find housekeepers and cleaning professionals who advertise their services in your area — from weekly upkeep to one-time deep cleans before a move, a sale or a celebration.',
    image: img('photo-1581578731548-c64695cc6952'),
    imageAlt: 'Cleaning professional wiping down a kitchen surface',
    needs: ['Recurring weekly or bi-weekly housekeeping', 'Deep cleaning before or after an event', 'Move-in and move-out cleaning', 'Office and small commercial cleaning'],
    serviceTypes: ['Housekeeping', 'Deep cleaning', 'Move-out cleaning', 'Window cleaning', 'Office cleaning'],
    faqs: [
      { q: 'Can I find someone for a one-time deep clean?', a: 'Yes. Many cleaning providers on Fleeket offer one-time services as well as recurring visits. Check the provider’s listing for the services they advertise.' },
      { q: 'Do cleaners bring their own supplies?', a: 'It depends on the provider. Confirm supplies, equipment and any special requests directly with the provider once you connect.' },
    ],
  }),
  c({
    name: 'Renovation',
    slug: 'renovation',
    group: 'Home & Property',
    icon: 'hammer',
    featured: true,
    shortDescription: 'Contractors and tradespeople for kitchens, bathrooms, flooring and repairs.',
    description:
      'Whether it’s a full kitchen remodel or a few rooms of new flooring, the right contractor makes all the difference. Browse renovation professionals advertising on Fleeket and connect directly to discuss scope, timing and budget.',
    image: img('photo-1731168273756-e02cae42265b'),
    imageAlt: 'Contractor cutting tile with an angle grinder',
    needs: ['Kitchen and bathroom remodels', 'Flooring, tiling and drywall', 'Basement finishing', 'Repairs before listing a home'],
    serviceTypes: ['General contracting', 'Flooring', 'Tiling', 'Drywall & painting', 'Carpentry'],
    faqs: [
      { q: 'How do I compare renovation providers?', a: 'Review each listing’s services and service area, then connect with the providers that fit your project to discuss scope, timelines and quotes.' },
      { q: 'Does Fleeket manage my renovation project?', a: 'No. Fleeket helps you discover and connect with providers. Your agreement, schedule and payment for the work are arranged directly with the provider.' },
    ],
  }),
  c({
    name: 'Moving Services',
    slug: 'moving',
    group: 'Home & Property',
    icon: 'truck',
    featured: true,
    shortDescription: 'Local movers, packing help and delivery for homes and small businesses.',
    description:
      'Moving is easier with people who do it every day. Find movers and delivery providers who advertise on Fleeket for local moves, packing support, single-item delivery and small office relocations.',
    image: img('photo-1758523670991-ee93bc48d81d'),
    imageAlt: 'Two people carrying moving boxes into a new home',
    needs: ['Apartment and house moves', 'Packing and unpacking help', 'Single-item and furniture delivery', 'Small office relocation'],
    serviceTypes: ['Local moving', 'Packing services', 'Furniture delivery', 'Junk removal'],
    faqs: [
      { q: 'Can I book movers for a small job?', a: 'Many moving providers handle single items or partial loads. Describe your move when you connect so the provider can confirm availability.' },
      { q: 'How far in advance should I connect with a mover?', a: 'As early as you can — especially at the end of the month and during summer, when demand is highest.' },
    ],
  }),
  c({
    name: 'Pest Control',
    slug: 'pest-control',
    group: 'Home & Property',
    icon: 'bug',
    shortDescription: 'Inspection, treatment and prevention for homes and businesses.',
    description:
      'From ants in the kitchen to mice in the garage, pest problems call for fast, informed help. Connect with pest control providers who advertise inspection, treatment and prevention services in your area.',
    image: img('photo-1747659629851-a92bd71149f6'),
    imageAlt: 'Pest control technician holding a spray applicator',
    needs: ['Rodent inspection and removal', 'Insect treatment', 'Seasonal prevention plans', 'Commercial pest management'],
    serviceTypes: ['Inspection', 'Rodent control', 'Insect treatment', 'Prevention plans'],
    faqs: [
      { q: 'What should I tell a pest control provider?', a: 'Share what you’ve seen, where, and for how long. Photos help the provider recommend the right next step.' },
      { q: 'Are treatments safe for pets and children?', a: 'Ask the provider directly — they can explain the products and precautions involved for your situation.' },
    ],
  }),
  c({
    name: 'Seasonal Services',
    slug: 'seasonal',
    group: 'Home & Property',
    icon: 'snowflake',
    featured: true,
    shortDescription: 'Snow removal, yard care and seasonal property upkeep.',
    description:
      'Canadian and northern U.S. seasons ask a lot of a property. Find providers for snow clearing, lawn and garden care, leaf cleanup and the seasonal jobs that keep a home ready for whatever the weather brings.',
    image: img('photo-1551477240-20aa0faebd45'),
    imageAlt: 'Person clearing a driveway with a snow blower',
    needs: ['Driveway and walkway snow clearing', 'Spring and fall yard cleanup', 'Lawn mowing and garden care', 'Gutter cleaning'],
    serviceTypes: ['Snow removal', 'Lawn care', 'Yard cleanup', 'Gutter cleaning', 'Holiday lighting'],
    faqs: [
      { q: 'Can I arrange snow clearing for the whole season?', a: 'Many seasonal providers offer per-visit and seasonal arrangements. Confirm terms directly when you connect.' },
      { q: 'Do seasonal providers work year-round?', a: 'Some do, switching from yard care to snow removal. Each listing shows the services the provider advertises.' },
    ],
  }),
  c({
    name: 'Technicians',
    slug: 'technicians',
    group: 'Home & Property',
    icon: 'monitor-smartphone',
    shortDescription: 'Repair and installation for electronics, appliances and home technology.',
    description:
      'When a device, appliance or home system stops working, you need someone who knows it inside out. Connect with technicians who advertise repair, installation and setup services for the technology you rely on.',
    image: img('photo-1550041473-d296a3a8a18a'),
    imageAlt: 'Technician repairing a smartphone on a workbench',
    needs: ['Phone, tablet and computer repair', 'Appliance repair', 'TV mounting and home theatre setup', 'Wi-Fi and smart home installation'],
    serviceTypes: ['Electronics repair', 'Appliance repair', 'Installations', 'Smart home setup'],
    faqs: [
      { q: 'Can a technician come to my home?', a: 'Many technicians offer on-site visits, others work from a shop. Each listing shows how the provider operates.' },
      { q: 'What details help a technician quote accurately?', a: 'The make and model, what happened, and any error messages or photos you can share.' },
    ],
  }),
  c({
    name: 'Wood Craft',
    slug: 'wood-craft',
    group: 'Home & Property',
    icon: 'ruler',
    shortDescription: 'Custom furniture, cabinetry, carpentry and woodworking.',
    description:
      'Handmade pieces and precise carpentry add character that mass-produced furniture can’t match. Discover woodworkers and carpenters advertising custom builds, repairs and restoration.',
    image: img('photo-1631396326838-de37e5f8bcbc'),
    imageAlt: 'Woodworker shaping a piece of timber in a workshop',
    needs: ['Custom furniture and shelving', 'Cabinet building and refacing', 'Furniture repair and restoration', 'Decks, fences and outdoor builds'],
    serviceTypes: ['Custom furniture', 'Cabinetry', 'Restoration', 'Outdoor carpentry'],
    faqs: [
      { q: 'Can I request a one-of-a-kind piece?', a: 'Yes — custom work is what many woodworkers specialise in. Share dimensions, materials and inspiration images when you connect.' },
      { q: 'How long do custom builds take?', a: 'Timelines vary by project and workshop schedule. Your provider can give you a realistic estimate.' },
    ],
  }),
  c({
    name: 'Automotive',
    slug: 'automotive',
    group: 'Auto & Transport',
    icon: 'wrench',
    featured: true,
    shortDescription: 'Mechanics, detailing, tires and vehicle maintenance.',
    description:
      'Keep your vehicle safe and road-ready with automotive professionals near you. Fleeket lists mechanics, detailers and tire specialists so you can compare options and connect directly.',
    image: img('photo-1615906655593-ad0386982a0f'),
    imageAlt: 'Mechanic working on a car engine',
    needs: ['Routine maintenance and oil changes', 'Diagnostics and repairs', 'Seasonal tire changes', 'Interior and exterior detailing'],
    serviceTypes: ['Mechanical repair', 'Diagnostics', 'Tire services', 'Detailing', 'Mobile mechanics'],
    faqs: [
      { q: 'Are there mobile mechanics on Fleeket?', a: 'Some automotive providers advertise mobile service. Look for it in the provider’s listing or ask when you connect.' },
      { q: 'What should I share before a repair quote?', a: 'Your vehicle’s year, make, model and mileage, plus a description of the issue and when it happens.' },
    ],
  }),
  c({
    name: 'Towing',
    slug: 'towing',
    group: 'Auto & Transport',
    icon: 'life-buoy',
    shortDescription: 'Roadside help, vehicle transport and towing.',
    description:
      'A breakdown is stressful enough. Find towing and roadside assistance providers who advertise in your area for emergency tows, battery boosts, lockouts and planned vehicle transport.',
    image: img('photo-1686966933735-305bd8fe0a77'),
    imageAlt: 'Car being loaded onto a flatbed tow truck',
    needs: ['Emergency towing', 'Battery boosts and lockouts', 'Flat tire assistance', 'Vehicle transport between locations'],
    serviceTypes: ['Emergency towing', 'Roadside assistance', 'Flatbed transport', 'Winch-outs'],
    faqs: [
      { q: 'Can I find towing for a non-emergency move?', a: 'Yes. Many towing providers also transport vehicles on a scheduled basis.' },
      { q: 'What information does a tow operator need?', a: 'Your exact location, vehicle details, the destination and whether the vehicle can roll or steer.' },
    ],
  }),
  c({
    name: 'Car Pooling',
    slug: 'car-pooling',
    group: 'Auto & Transport',
    icon: 'car',
    shortDescription: 'Shared rides for commutes, school runs and regular trips.',
    description:
      'Shared rides save money and reduce traffic. Connect with people and providers advertising car pooling for daily commutes, school runs and recurring trips between communities.',
    image: img('photo-1636935529049-2078e9ee3e6c'),
    imageAlt: 'Driver navigating a city street',
    needs: ['Daily commute sharing', 'School and activity runs', 'Regular inter-city trips', 'Event transportation'],
    serviceTypes: ['Commuter car pools', 'School runs', 'Inter-city rides'],
    faqs: [
      { q: 'How are car pool costs arranged?', a: 'Cost sharing is agreed directly between riders and drivers. Fleeket helps you find and connect with each other.' },
      { q: 'What should I confirm before sharing a ride?', a: 'Pickup points, timing, cost sharing and any expectations — agree on these clearly before your first trip.' },
    ],
  }),
  c({
    name: 'Driving Instructors',
    slug: 'driving-instructors',
    group: 'Auto & Transport',
    icon: 'car-front',
    shortDescription: 'Lessons for new drivers, refreshers and road-test preparation.',
    description:
      'Confident drivers start with good instruction. Find driving instructors who advertise lessons for new drivers, road-test preparation and refresher sessions for experienced drivers returning to the road.',
    image: img('photo-1630406144797-821be1f35d75'),
    imageAlt: 'Driving instructor with a clipboard beside a car',
    needs: ['Lessons for new drivers', 'Road-test preparation', 'Highway and winter driving practice', 'Refresher lessons'],
    serviceTypes: ['Beginner lessons', 'Road-test prep', 'Refresher courses', 'Winter driving'],
    faqs: [
      { q: 'Can I book a single refresher lesson?', a: 'Many instructors offer individual lessons as well as packages. Ask about options when you connect.' },
      { q: 'Do instructors provide a vehicle?', a: 'This varies by instructor. Check their listing or confirm directly before your first lesson.' },
    ],
  }),
  c({
    name: 'Child Care',
    slug: 'child-care',
    group: 'Family & Learning',
    icon: 'baby',
    featured: true,
    shortDescription: 'Babysitters, nannies and after-school care.',
    description:
      'Finding care you trust takes time and conversation. Fleeket helps you discover child care providers advertising babysitting, nanny services and after-school care, so you can connect and get to know them directly.',
    image: img('photo-1587323655395-b1c77a12c89a'),
    imageAlt: 'Adult and child drawing together at a table',
    needs: ['Occasional babysitting', 'Full-time or part-time nanny care', 'After-school pickup and care', 'Date-night and event sitters'],
    serviceTypes: ['Babysitting', 'Nanny services', 'After-school care', 'Overnight care'],
    faqs: [
      { q: 'How should I choose a child care provider?', a: 'Meet in person, ask about experience, references and any certifications, and make sure you’re comfortable before arranging care.' },
      { q: 'Does Fleeket screen child care providers?', a: 'Fleeket is a discovery and advertising platform. Always do your own due diligence, including references and any checks appropriate in your province or state.' },
    ],
  }),
  c({
    name: 'Tutoring',
    slug: 'tutoring',
    group: 'Family & Learning',
    icon: 'graduation-cap',
    featured: true,
    shortDescription: 'Academic support, test preparation and skill-based lessons.',
    description:
      'The right tutor can change how a student feels about learning. Find tutors advertising support across subjects and grade levels, test preparation, language lessons and skill-based instruction — in person or online.',
    image: img('photo-1653276055789-26fdc328680f'),
    imageAlt: 'Student working through a textbook with a pencil',
    needs: ['Math, science and literacy support', 'Exam and test preparation', 'Language lessons', 'Music and skill-based lessons'],
    serviceTypes: ['Academic tutoring', 'Test prep', 'Language lessons', 'Online tutoring'],
    faqs: [
      { q: 'Can I find online tutors?', a: 'Yes. Many tutors offer online sessions as well as in-person lessons. Their listing shows what they advertise.' },
      { q: 'What should I share with a potential tutor?', a: 'The subject, grade level, goals and timing — for example an upcoming exam — help a tutor plan effectively.' },
    ],
  }),
  c({
    name: 'Pet Services',
    slug: 'pet-services',
    group: 'Family & Learning',
    icon: 'paw-print',
    shortDescription: 'Grooming, walking, sitting and pet care.',
    description:
      'Pets are family. Connect with pet care providers who advertise grooming, dog walking, pet sitting and boarding, and find someone who fits your pet’s routine and personality.',
    image: img('photo-1528846104175-4fd300ee59da'),
    imageAlt: 'Groomer brushing a dog’s coat',
    needs: ['Dog walking', 'Grooming and bathing', 'Pet sitting while you travel', 'Training support'],
    serviceTypes: ['Dog walking', 'Grooming', 'Pet sitting', 'Boarding', 'Training'],
    faqs: [
      { q: 'Can I arrange a meet-and-greet first?', a: 'We recommend it. Most pet care providers are happy to meet you and your pet before the first booking.' },
      { q: 'What should a pet sitter know?', a: 'Feeding routines, medications, vet contacts and any behaviour notes help a sitter care for your pet well.' },
    ],
  }),
  c({
    name: 'Health & Wellness',
    slug: 'health-wellness',
    group: 'Wellness & Lifestyle',
    icon: 'heart-pulse',
    shortDescription: 'Fitness, yoga, massage and wellness practitioners.',
    description:
      'Wellness looks different for everyone. Discover practitioners who advertise fitness training, yoga, massage and holistic wellness services, and connect with the approach that suits you.',
    image: img('photo-1552196563-55cd4e45efb3'),
    imageAlt: 'Woman practising yoga in a bright studio',
    needs: ['Personal training', 'Yoga and mobility classes', 'Massage therapy', 'Nutrition and wellness guidance'],
    serviceTypes: ['Personal training', 'Yoga', 'Massage', 'Nutrition coaching'],
    faqs: [
      { q: 'Are wellness providers licensed?', a: 'Requirements differ by profession and province or state. Ask providers about their credentials before booking.' },
      { q: 'Can I find in-home sessions?', a: 'Some practitioners offer mobile or in-home sessions. Check the listing or ask when you connect.' },
    ],
  }),
  c({
    name: 'Life Coaching',
    slug: 'life-coaching',
    group: 'Wellness & Lifestyle',
    icon: 'compass',
    shortDescription: 'Personal, career and leadership coaching.',
    description:
      'Sometimes the next step is clearer with someone in your corner. Find coaches who advertise personal development, career transition and leadership coaching, in person or online.',
    image: img('photo-1524758870432-af57e54afa26'),
    imageAlt: 'Two people in conversation in a relaxed living room',
    needs: ['Career change and job search', 'Goal setting and accountability', 'Leadership development', 'Work-life balance'],
    serviceTypes: ['Career coaching', 'Personal coaching', 'Leadership coaching'],
    faqs: [
      { q: 'How do I know if a coach is the right fit?', a: 'Many coaches offer an introductory conversation. Use it to understand their approach and whether it suits your goals.' },
      { q: 'Is coaching the same as therapy?', a: 'No. Coaching focuses on goals and action. If you need mental health support, seek a licensed professional.' },
    ],
  }),
  c({
    name: 'Image Consulting',
    slug: 'image-consulting',
    group: 'Wellness & Lifestyle',
    icon: 'shirt',
    shortDescription: 'Personal styling, wardrobe and professional presence.',
    description:
      'How you present yourself shapes first impressions. Connect with image consultants advertising personal styling, wardrobe planning and professional presence coaching for interviews, events and everyday confidence.',
    image: img('photo-1595476108010-b4d1f102b1b1'),
    imageAlt: 'Stylist holding a garment on a hanger',
    needs: ['Wardrobe audits and planning', 'Personal shopping', 'Interview and event styling', 'Professional presence coaching'],
    serviceTypes: ['Personal styling', 'Wardrobe planning', 'Personal shopping'],
    faqs: [
      { q: 'Do image consultants work virtually?', a: 'Some do. Virtual sessions are common for wardrobe planning; others prefer in-person fittings.' },
      { q: 'What does a first session involve?', a: 'Usually a conversation about your goals, lifestyle and current wardrobe. Your consultant will outline their process.' },
    ],
  }),
  c({
    name: 'Tailoring',
    slug: 'tailoring',
    group: 'Wellness & Lifestyle',
    icon: 'scissors',
    shortDescription: 'Alterations, repairs and custom garments.',
    description:
      'A good tailor makes clothes fit the way they should. Find tailors advertising alterations, repairs and custom garments — from hemming and resizing to made-to-measure pieces.',
    image: img('photo-1718184021018-d2158af6b321'),
    imageAlt: 'Tailor cutting fabric with shears',
    needs: ['Hemming and resizing', 'Suit and formalwear alterations', 'Garment repair', 'Custom-made clothing'],
    serviceTypes: ['Alterations', 'Repairs', 'Custom garments', 'Formalwear'],
    faqs: [
      { q: 'How long do alterations take?', a: 'Simple alterations can be quick; formalwear may need more time and fittings. Confirm timing with your tailor.' },
      { q: 'Should I bring the shoes I’ll wear?', a: 'For trousers and dresses, yes — it helps your tailor get the length right.' },
    ],
  }),
  c({
    name: 'Cooking & Meal Preparation',
    slug: 'cooking-meal-preparation',
    group: 'Wellness & Lifestyle',
    icon: 'chef-hat',
    shortDescription: 'Personal chefs, meal prep and private cooking.',
    description:
      'Good food without the weeknight scramble. Discover personal chefs and cooks advertising weekly meal preparation, private dinners and dietary-specific cooking.',
    image: img('photo-1729764335236-560daf0eb7ab'),
    imageAlt: 'Cook preparing a meal at a stove',
    needs: ['Weekly meal preparation', 'Private dinners and gatherings', 'Dietary and allergy-aware meals', 'Cooking lessons'],
    serviceTypes: ['Meal prep', 'Personal chef', 'Private dining', 'Cooking lessons'],
    faqs: [
      { q: 'Can a chef accommodate dietary needs?', a: 'Many can. Share allergies and preferences clearly when you connect so the provider can confirm.' },
      { q: 'Who buys the groceries?', a: 'Arrangements vary. Some chefs shop for you, others cook with ingredients you provide.' },
    ],
  }),
  c({
    name: 'Event Planning',
    slug: 'event-planning',
    group: 'Events & Creative',
    icon: 'calendar-days',
    featured: true,
    shortDescription: 'Planners and coordinators for weddings, parties and corporate events.',
    description:
      'Great events come from careful planning. Find event planners and coordinators who advertise wedding planning, private celebrations and corporate events, and connect to talk through your vision.',
    image: img('photo-1511795409834-ef04bbd61622'),
    imageAlt: 'Elegant table setting with a floral centrepiece',
    needs: ['Wedding planning and day-of coordination', 'Birthday and milestone celebrations', 'Corporate events', 'Décor and vendor coordination'],
    serviceTypes: ['Wedding planning', 'Corporate events', 'Private parties', 'Décor'],
    faqs: [
      { q: 'When should I contact an event planner?', a: 'For weddings and large events, many months ahead. Smaller gatherings can often be planned in a few weeks.' },
      { q: 'Can I hire a planner just for the day?', a: 'Many planners offer day-of coordination as a standalone service.' },
    ],
  }),
  c({
    name: 'Photography',
    slug: 'photography',
    group: 'Events & Creative',
    icon: 'camera',
    shortDescription: 'Event, portrait, product and real-estate photography.',
    description:
      'Moments and products deserve to be captured well. Discover photographers advertising events, portraits, product shoots and real-estate photography.',
    image: img('photo-1542038784456-1ea8e935640e'),
    imageAlt: 'Photographer holding a camera outdoors',
    needs: ['Event and wedding photography', 'Portraits and headshots', 'Product photography', 'Real-estate photography'],
    serviceTypes: ['Events', 'Portraits', 'Product', 'Real estate'],
    faqs: [
      { q: 'How do I compare photographers?', a: 'Look at the work they share, the services they advertise and their availability for your date.' },
      { q: 'Who owns the photos?', a: 'Usage rights vary. Agree on rights and delivery formats with your photographer before the shoot.' },
    ],
  }),
  c({
    name: 'Realtors',
    slug: 'realtors',
    group: 'Business & Local',
    icon: 'house',
    shortDescription: 'Real-estate agents for buying, selling and renting.',
    description:
      'Buying or selling a home is one of life’s big decisions. Connect with realtors who advertise on Fleeket and find an agent who knows your market.',
    image: img('photo-1724482606633-fa74fe4f5de1'),
    imageAlt: 'Hand holding house keys above a model home',
    needs: ['Selling a home', 'Buying a first home', 'Rental and leasing support', 'Market evaluations'],
    serviceTypes: ['Residential sales', 'Buyer representation', 'Rentals', 'Evaluations'],
    faqs: [
      { q: 'How do I choose a realtor?', a: 'Speak with more than one agent, ask about their local experience and how they plan to market or search for you.' },
      { q: 'Are realtors on Fleeket licensed?', a: 'Real-estate agents must be licensed in their province or state. Confirm an agent’s registration with your local regulator.' },
    ],
  }),
  c({
    name: 'Taxes',
    slug: 'taxes',
    group: 'Business & Local',
    icon: 'calculator',
    shortDescription: 'Tax preparation, bookkeeping and filing support.',
    description:
      'Tax season is simpler with the right help. Find tax preparers and bookkeepers who advertise personal returns, small-business filing and year-round bookkeeping.',
    image: img('photo-1554224155-6726b3ff858f'),
    imageAlt: 'Person reviewing financial documents with a calculator',
    needs: ['Personal tax returns', 'Self-employed and small-business filing', 'Bookkeeping', 'Help with prior-year returns'],
    serviceTypes: ['Personal tax', 'Business tax', 'Bookkeeping'],
    faqs: [
      { q: 'What should I bring to a tax preparer?', a: 'Your tax slips, receipts for deductions or credits, and last year’s return are a good start. Your preparer will advise on anything else.' },
      { q: 'Can tax providers help with Canadian and U.S. returns?', a: 'Some specialise in cross-border filing. Ask about it specifically when you connect.' },
    ],
  }),
  c({
    name: 'Local Farmers',
    slug: 'local-farmers',
    group: 'Business & Local',
    icon: 'sprout',
    shortDescription: 'Fresh produce, farm goods and local food producers.',
    description:
      'Buy closer to home. Discover local farmers and producers advertising seasonal produce, eggs, honey, meat and farm goods — and support the growers in your community.',
    image: img('photo-1526399743290-f73cb4022f48'),
    imageAlt: 'Shoppers browsing produce at a farmers’ market',
    needs: ['Seasonal fruit and vegetables', 'Eggs, dairy and meat', 'Farm boxes and subscriptions', 'Plants and seedlings'],
    serviceTypes: ['Produce', 'Farm boxes', 'Meat & dairy', 'Plants'],
    faqs: [
      { q: 'Do local farmers deliver?', a: 'Some offer delivery or pickup points; others sell at the farm or at markets. Each listing explains their approach.' },
      { q: 'Can I buy in bulk?', a: 'Many producers sell bulk quantities in season. Ask about availability when you connect.' },
    ],
  }),
  c({
    name: 'Garage Sales',
    slug: 'garage-sales',
    group: 'Business & Local',
    icon: 'tag',
    shortDescription: 'Local garage sales, yard sales and second-hand finds.',
    description:
      'One person’s clear-out is another’s find. Advertise or discover garage sales, yard sales and estate sales in your community.',
    image: img('photo-1516382461343-35e1ba016e01'),
    imageAlt: 'Second-hand books laid out on a table',
    needs: ['Advertising a garage or yard sale', 'Finding sales nearby', 'Estate and moving sales'],
    serviceTypes: ['Garage sales', 'Yard sales', 'Estate sales'],
    faqs: [
      { q: 'Can I advertise my own garage sale?', a: 'Yes. Contact us or use the provider listing form to advertise your sale on Fleeket.' },
      { q: 'How early should I post a sale?', a: 'A week or so ahead gives people time to plan their visit.' },
    ],
  }),
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
      'Fleeket is a digital advertising and service-discovery platform. Service providers advertise what they offer; people who need a service search by category and area, compare listings and connect directly with the provider that fits. It’s a more direct alternative to flyers, door hangers and other traditional advertising.',
  },
  {
    topic: 'General',
    question: 'How do I sign up for Fleeket?',
    answer:
      'Select “Create account”, enter your name, email and a password, and choose whether you’re looking for services or offering them. Your account is ready immediately.',
  },
  {
    topic: 'Customers',
    question: 'How do I select a service provider?',
    answer:
      'Browse or search the category you need, review the providers listed for your area, and choose the one whose services, location and approach suit your job. Once you’ve chosen, you receive the provider’s contact details so you can connect directly.',
  },
  {
    topic: 'Pricing & payments',
    question: 'What does it cost to connect with a provider?',
    answer:
      'Connecting with a provider is a flat $9.99. Once your payment is confirmed, the provider’s contact details are sent to your email so you can reach out at your convenience. Any work you arrange is quoted and paid directly to the provider.',
  },
  {
    topic: 'Pricing & payments',
    question: 'Is my payment secure on Fleeket?',
    answer:
      'Payments are processed by third-party payment providers over encrypted connections. If you have a question about a charge, email fleeket@outlook.com and our team will help.',
  },
  {
    topic: 'Providers',
    question: 'I offer a service. How do I get listed?',
    answer:
      'Visit the For Service Providers page and submit your details — your business, the category you serve and your service area. Our team will follow up to set up your listing.',
  },
  {
    topic: 'Providers',
    question: 'Why advertise on Fleeket instead of traditional advertising?',
    answer:
      'Flyers and cold outreach reach people whether or not they need you. On Fleeket, your service is visible to people who are actively searching for it in your category and area.',
  },
  {
    topic: 'General',
    question: 'Where is Fleeket available?',
    answer:
      'Fleeket lists service providers across Canada’s provinces and territories, and the platform is built to expand into the United States. See Areas Served for the current list.',
  },
]

const legal = (title: string, intro: string, sections: { heading: string; body: string }[], seoDescription: string) => ({
  title,
  heroImage: img('photo-1566836610593-62a64888a216'),
  effectiveDate: 'March 17, 2026',
  intro,
  sections,
  seoTitle: title,
  seoDescription,
})

export const DEFAULT_CONTENT = {
  home: {
    heroEyebrow: 'Service discovery for Canada & the United States',
    heroHeading: 'Connecting needs|with *expert deeds.*',
    heroBody:
      'Fleeket helps people find the right service provider — and helps providers get discovered by the people already looking for what they do.',
    primaryCta: 'Explore services',
    secondaryCta: 'Advertise your service',
    heroImage: img('photo-1728379891769-5429538b17fc'),
    heroImageAlt: 'Craftsperson restoring a piece of furniture in a sunlit workshop',
    customersTitle: 'Find the right help, without the guesswork.',
    customersBody:
      'Search by what you need and where you are. Compare providers in one place, choose with confidence, and connect directly.',
    customersImage: img('photo-1758876201450-cf77ab8b95bc'),
    providersTitle: 'Get found by people already looking for you.',
    providersBody:
      'Put your service in front of customers who are actively searching for it — not people skimming past a flyer.',
    providersImage: img('photo-1687422808248-f807f4ea2a2e'),
    statement:
      'Advertising shouldn’t mean interrupting people who don’t need you. Fleeket puts your service where demand already is — so every connection starts with a real need.',
    finalTitle: 'Where demand meets expertise.',
    finalBody: 'Whether you need a hand or you are the hand — start here.',
    seoTitle: 'Fleeket — Find trusted local services across Canada & the U.S.',
    seoDescription:
      'Fleeket connects people looking for services with the professionals ready to deliver them. Search cleaning, moving, tutoring, automotive, renovation and more.',
  },
  about: {
    eyebrow: 'About Fleeket',
    heading: 'Every need has someone ready to meet it. We make the introduction.',
    intro:
      'Fleeket is a digital advertising and service-discovery platform. We connect people who need something done with the service providers who can do it — clearly, directly and without the noise of traditional advertising.',
    image: img('photo-1761783536272-2fb78dd52c76'),
    problemTitle: 'The problem',
    problemBody:
      'Finding a reliable provider still means asking around, scrolling through scattered listings and hoping for the best. On the other side, skilled independents and small businesses spend money on flyers, door hangers and broad ads that mostly reach people who don’t need them. Both sides are looking for each other — and missing.',
    approachTitle: 'Our approach',
    approachBody:
      'Fleeket organises services into clear categories and areas, so customers can search by what they need and where they are. Providers advertise to people who are already looking. When the fit is right, both sides connect directly — no middle layer, no bidding wars.',
    principles: [
      { title: 'Demand first', body: 'Every connection on Fleeket starts with someone actively looking for a service.' },
      { title: 'Direct connection', body: 'Customers and providers talk to each other directly and agree on the work themselves.' },
      { title: 'Clear and fair', body: 'Simple categories, simple pricing and no inflated claims — for customers and providers alike.' },
      { title: 'Local by design', body: 'Built around the provinces, territories and communities where services actually happen.' },
    ],
    secondaryImage: img('photo-1687293233211-6b0cc3beba70'),
    visionTitle: 'Where we are going',
    visionBody:
      'We are building a more direct digital marketplace for services across Canada and the United States — one where the skill of the person doing the work is what gets noticed, and where finding help feels as simple as describing what you need.',
    seoTitle: 'About Fleeket — Connecting needs with expert deeds',
    seoDescription:
      'Fleeket is a digital advertising and service-discovery platform connecting people who need services with providers ready to deliver them.',
  },
  howItWorks: {
    eyebrow: 'How it works',
    heading: 'From “I need a hand” to the right person — in four moves.',
    body: 'A clear path for customers, and a clear way for providers to be found.',
    heroImage: img('photo-1585541484781-f3b00759eecf'),
    stages: [
      { title: 'Start your journey', body: 'Create your Fleeket account in a minute — just your name, email and a password. Tell us whether you’re looking for help or offering it.', detail: 'Free to create an account' },
      { title: 'Explore your options', body: 'Search by service or browse categories, filtered to your province or territory. Compare providers side by side and read what each one offers.', detail: '25 service categories' },
      { title: 'Make your choice', body: 'Found the right fit? Unlock the provider’s contact details for a flat $9.99 through secure checkout.', detail: 'One flat fee per connection' },
      { title: 'Connect and get moving', body: 'The provider’s contact information arrives in your inbox. Reach out on your schedule and arrange the work directly.', detail: 'Delivered straight to your email' },
    ],
    seoTitle: 'How Fleeket Works — Search, compare, choose, connect',
    seoDescription:
      'See how Fleeket connects you with service providers in four simple steps: create an account, explore options, make your choice and connect directly.',
  },
  providers: {
    eyebrow: 'For service providers',
    heading: 'Be the first name people find when they need what you do.',
    body:
      'Fleeket puts your business in front of customers who are actively searching for your service in your area — a more direct alternative to flyers, door hangers and broad advertising.',
    image: img('photo-1631396326646-c06a935ff3a6'),
    benefits: [
      { title: 'Get discovered', body: 'Appear in the category and area where customers are searching for exactly what you offer.' },
      { title: 'Reach active demand', body: 'Every visitor to your category is looking for a service — not scrolling past an ad.' },
      { title: 'Showcase your expertise', body: 'Describe your services, your service area and what makes your work stand out.' },
      { title: 'Connect directly', body: 'Customers reach you directly. You agree on the job, the price and the schedule yourself.' },
      { title: 'Expand your visibility', body: 'Be visible nearby and beyond, across the provinces and territories you serve.' },
      { title: 'Build steady demand', body: 'Turn one-off discoveries into repeat customers and referrals over time.' },
    ],
    steps: [
      { title: 'Tell us about your service', body: 'Share your business, category and the areas you cover through our listing form.' },
      { title: 'We set up your listing', body: 'Our team reviews your details and follows up to publish your listing.' },
      { title: 'Customers find you', body: 'People searching your category and area can discover your service and get in touch.' },
    ],
    formTitle: 'List your service',
    formBody: 'Send us your details and our team will be in touch to get your listing live.',
    seoTitle: 'Advertise Your Service on Fleeket — For Service Providers',
    seoDescription:
      'Get discovered by customers actively searching for your service. List your business on Fleeket and connect directly with new customers.',
  },
  customers: {
    eyebrow: 'For customers',
    heading: 'The right provider, found the right way.',
    body:
      'Tell Fleeket what you need and where you are. We bring the providers to one place so you can compare, choose and connect — without chasing recommendations.',
    image: img('photo-1758598497259-b51e6ed6c73c'),
    steps: [
      { title: 'Search', body: 'Describe what you need or browse 25 service categories, filtered to your province or territory.' },
      { title: 'Compare', body: 'Review providers side by side — the services they offer, where they work and how they operate.' },
      { title: 'Choose', body: 'Pick the provider who fits your job and unlock their contact details for a flat $9.99.' },
      { title: 'Connect', body: 'Their details arrive by email. Reach out directly and arrange the work on your terms.' },
    ],
    assurances: [
      { title: 'One clear fee', body: 'A flat price per connection. No subscriptions, no bidding, no surprises.' },
      { title: 'Direct relationships', body: 'You speak with the provider yourself and agree on the work directly.' },
      { title: 'Real help when you need it', body: 'Questions about your account or a connection? Our team is a message away.' },
    ],
    seoTitle: 'Find a Service Provider — For Customers | Fleeket',
    seoDescription:
      'Search, compare and connect with local service providers for cleaning, moving, tutoring, automotive, renovation and more — for one flat fee.',
  },
  servicesPage: {
    eyebrow: 'Services',
    heading: 'Every kind of help, organised.',
    body: 'Browse 25 service categories across home, transport, family, wellness, events and local business — or search for exactly what you need.',
    heroImage: img('photo-1683115099191-51e617fc5ff1'),
    seoTitle: 'Services — Browse all service categories | Fleeket',
    seoDescription:
      'Explore Fleeket service categories: cleaning, renovation, moving, automotive, towing, tutoring, child care, pet services, wellness, photography and more.',
  },
  citiesPage: {
    eyebrow: 'Areas served',
    heading: 'Built for every province and territory.',
    body: 'Fleeket lists service providers across Canada and is preparing for the United States. Choose your area to explore what’s available.',
    heroImage: img('photo-1752980661433-1bf67f1ab9c9'),
    seoTitle: 'Areas Served — Canada & United States | Fleeket',
    seoDescription:
      'Find service providers in Alberta, British Columbia, Ontario, Quebec and every Canadian province and territory on Fleeket.',
  },
  faqPage: {
    eyebrow: 'FAQ',
    heading: 'Answers, plainly.',
    body: 'Everything you need to know about finding a provider, advertising your service and how pricing works.',
    heroImage: img('photo-1651407825801-eec2dcbd86bd'),
    seoTitle: 'Frequently Asked Questions | Fleeket',
    seoDescription: 'Answers to common questions about Fleeket: how it works, signing up, choosing a provider, pricing and payments.',
  },
  contactPage: {
    eyebrow: 'Contact',
    heading: 'Let’s talk.',
    body: 'Questions about finding a provider, advertising your service or your account — send us a message and our team will respond.',
    heroImage: img('photo-1497032628192-86f99bcd76bc'),
    seoTitle: 'Contact Fleeket',
    seoDescription: 'Contact the Fleeket team about finding a service provider, advertising your business, partnerships or account support.',
  },
  pricing: {
    amount: 9.99,
    currency: '',
    unit: 'per provider connection',
    eyebrow: 'Pricing',
    heading: 'One fair price. Nothing hidden.',
    body: 'Browsing Fleeket is free. When you’ve found the provider you want, unlock their contact details for a single flat fee.',
    heroImage: img('photo-1499750310107-5fef28a66643'),
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
    footerStatement: 'A digital advertising and service-discovery platform connecting people who need services with the providers ready to deliver them.',
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
