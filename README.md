# Fleeket

A rebuild of **www.fleeket.com** with the same look, pages and categories as the live site, plus an admin panel, pricing plans per category, a subscriber map and three pay-per-ad categories (open house, garage sale, free ads).

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · MongoDB Atlas + Mongoose · Zod · Leaflet · jose · Nodemailer

**Look:** copied from the live site: Poppins, Fleeket red `#ec1c24`, member blue `#0d6efd`, grey bands `#e6e6e6` (tokens in `app/globals.css`). The admin keeps its own forest/cream palette.

## Quick start

```bash
npx pnpm install
cp .env.example .env.local   # then fill in MONGODB_URI, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npx pnpm dev
```

Open http://localhost:3000. On the first request with a database, the app **seeds itself** with the launch content (the live site's 22 categories and 47 sub-services with their original IDs, 13 provinces/territories, the 4 live FAQs, page copy, legal text) and creates the owner account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Sign in at `/login` → you land in `/admin`.

Without `MONGODB_URI` the public site still renders (read‑only, from the bundled launch content in `lib/defaults.ts`), forms return a friendly "temporarily unavailable" message and the admin explains what to configure.

## Environment variables

See [`.env.example`](.env.example) for the full list with notes.

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `MONGODB_DB` | No | Database name |
| `SESSION_SECRET` | Yes | Signs admin/user session cookies (32+ chars) |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Canonical domain — `https://www.fleeket.com` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First run | Bootstraps the first owner while no admin exists |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | No | Emails new leads to the notification address set in Admin → Site settings |
| `NEXT_PUBLIC_GA_ID` | No | GA4, loaded only after analytics consent |

## Deploying to Vercel

1. In MongoDB Atlas: create a cluster and a database user, and allow access from Vercel (Network Access → `0.0.0.0/0`, or Vercel's IP ranges on paid plans).
2. Import the repository in Vercel and add the environment variables above (Production + Preview).
3. Deploy. Public pages are statically generated and refreshed hourly; every admin save revalidates the site immediately.

## Project layout

```
app/
  (site)/          Public pages: home (slider, search, services, steps, FAQ), services/[slug],
                   services/[slug]/[sub] (taskers + request form), about, contact,
                   become-a-tasker, register, login, account, map, search, privacy, terms
  ServiceCategory/ Old live links /ServiceCategory/<id>[/<subId>] → 308 to the new slugs
  admin/           Dashboard, leads, categories/cities/faqs ([resource]), pages, pricing,
                   legal, media, users, settings (content/[key])
  actions/         Server actions — public.ts (forms, auth) and admin.ts (all CMS writes)
  api/upload       POST image upload → MongoDB (admin only)
  api/uploads/…    GET image bytes from MongoDB with immutable caching
  api/admin/leads/export   CSV export
  sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
components/        live/ (public UI copied from fleeket.com), forms/, map/, admin/, site/ (consent, JSON-LD), ui/
lib/
  models.ts        Mongoose models: Category, Plan, Subscriber, City, Faq, Lead, User, Content, StoredUpload
  live-catalog.ts  The live site's categories/sub-services (names, IDs, images)
  content.ts       Data access + first-run seeding (public reads fall back to defaults)
  defaults.ts      Launch content
  content-schema.ts / resources.ts   Field specs that drive admin forms AND their Zod validation
  auth.ts          scrypt password hashing, signed JWT session cookies, role checks
  seo.ts           getSiteUrl, buildMetadata, generatePageMetadata, noIndexMetadata
  uploads.ts       Upload URL parsing and cleanup of replaced images
proxy.ts           Optimistic redirect of signed-out visitors away from /admin and /account
```

## How content management works

- **Categories, areas served and FAQs** are database collections with create / edit / delete / publish / hide / reorder and bulk actions (`/admin/categories`, `/admin/cities`, `/admin/faqs`).
- **Pages, pricing, legal, site settings and SEO defaults** are keyed documents edited at `/admin/content/<key>`. Each form is generated from a field spec in `lib/content-schema.ts`, and the same spec builds the server-side Zod schema, so a field added there appears in the admin and is validated automatically.
- Headings support `|` for a line break and `*words*` for the serif accent.
- Legal and long-form text is stored as plain text and rendered as React nodes (blank line = paragraph, `- ` = bullet). No HTML is ever injected.

## Pricing plans, subscribers and maps

- **Pricing plans** (`/admin/plans`): payment strategies a category can use instead of the default connection fee (Admin → Pricing page). Each plan is *one-time* or *subscription* (monthly/yearly, optional free trial), paid by the customer or the provider. Pick a category's plan in its editor; leave it empty to keep the default.
- **Ad categories (pay per ad)**: *Open House - Realtors*, *Garage Sale* and *Free Ads - Lost Pets & More* use `listing` plans. People post an ad with a start and end date at `/services/<category>/post`; the price is the cheapest of the plan's **ad lengths** that covers those dates (add more lengths in Admin → Pricing plans to price shorter ads differently):
  - Open house: one house address per ad, up to 1 month, $9.99 CAD. Several houses → one ad each.
  - Garage sale: $9.99 CAD per ad, for any length from 1 day up to 1 month.
  - Free ads: $0, **checked by an admin first**: the admin is emailed, opens *Admin → Ads*, sets the status to *published*, and the poster is emailed that it's live.
  - Paid ads go to **Stripe Checkout** and publish themselves once paid (return page + `/api/stripe/webhook` backup; the amount is re-checked). Without `STRIPE_SECRET_KEY` they're saved as *awaiting payment* and the admin is emailed to take payment manually.
  - Ads disappear from the site after their end date. Abandoned checkouts stay in Admin → Ads as *awaiting payment*.
  - Seeded once (`__seeded_v3`), which also removed the earlier hidden placeholders. Pricing rule check: `node lib/listings.check.ts`.
- **Become A Tasker** (`/become-a-tasker`): creates a provider account plus one *pending* subscriber per chosen category (skills, hours, address) and a lead. Taskers are hidden until an admin sets them to *active* or *trial*.
- **Subscribers** (`/admin/subscribers`): service providers with category, sub-services, plan, status (pending, active, trial, past-due, paused, cancelled), hours, address and a map pin placed by clicking the map. The map pin is looked up automatically from the address (OpenStreetMap Nominatim, `lib/geocode.ts`) at sign-up and whenever a subscriber without a pin is saved; click the map in the editor to move it. Contact details stay private.
- **Requests**: customers choose taskers on `/services/<category>/<sub>` and send a request; it's stored as a *service-request* lead with the chosen taskers in the notes.
- **Maps**: `/map` (public) shows subscribers that are *published* and *active or trial*, with coordinates rounded to ~1 km before they reach the browser. `/admin/map` shows everyone at their exact pin, with inactive statuses muted.
- **Map tiles**: default to OpenStreetMap's public tiles, which are for light use only. Before launch traffic, set `NEXT_PUBLIC_MAP_TILE_URL` (and `_ATTRIBUTION`) to a keyed provider such as MapTiler or Stadia.
- **Tasker memberships** are recurring Stripe subscriptions (`lib/membership.ts`, `app/actions/membership.ts`). A published plan with billing *subscription* paid by *provider* appears on the tasker's account page; it renews until they cancel in Stripe's customer portal. Only the webhook records a membership; failed payments and cancellations set the tasker past-due / cancelled, which hides them from the map. Admin → Subscribers shows each membership; Admin → Promo codes gives new taskers 3/6/12 free months. Ads are not shown on the map.

## Images

Uploads never touch the filesystem (Vercel's is read-only). `POST /api/upload` checks the admin session, folder whitelist (`products | gallery | pages | misc`), MIME type, magic bytes and the 8 MB limit, then stores the bytes in the `StoredUpload` collection and returns `/api/uploads/<folder>/<filename>`. Only that URL is saved on content documents. Replacing or removing an image and saving deletes the old file. Legacy `/uploads/...` URLs fall back to `/placeholder.jpg`. Next/Image serves `/api/uploads/**` through `images.localPatterns`.

*Ceiling:* MongoDB documents max out at 16 MB, which is fine for web images up to 8 MB. If the media library grows large, move storage to S3/R2 behind the same `/api/upload` contract.

## Leads

Every form (contact, service request, provider listing) is validated with Zod on the server, rate-limited per IP, protected by a honeypot, stored as a `Lead` and, if SMTP is configured, emailed to the notification address. In `/admin/leads` you can filter, search, page through leads, change status (New → Contacted → Qualified → Converted / Closed / Spam) one at a time or in bulk, add notes and export CSV.

## Roles

`owner`, `admin` and `editor` can sign in to the admin. Editors manage content; only owners and admins manage users and site settings. `provider` accounts are created through `/become-a-tasker`. Customers don't need an account (older `customer` accounts still sign in). Roles are always re-read from the database on each request; the session token is never trusted alone.

## Security notes

- scrypt password hashing (`node:crypto`), httpOnly + SameSite=Lax session cookies (Secure in production)
- Every server action and API route re-checks authorisation; `proxy.ts` is only a fast pre-check
- In-memory rate limiting on login, registration, forms and uploads. *Ceiling:* it is per serverless instance; move it to Upstash/Redis if abuse appears
- Regex search input is escaped; CSV export neutralises spreadsheet formulas; JSON-LD output escapes `<`

## Before launch

- [ ] Confirm what the **$9.99** fee covers and its currency (Admin → Pricing). JSON-LD `Offer` markup is only emitted once a currency is set
- [ ] Have counsel review the Privacy Policy and Terms (Admin → Legal); they were restructured from the previous site's policy
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live domain and configure SMTP
- [ ] Images are loaded from `api.fleeket.com` / `www.fleeket.com`. Upload them to the Media library before the old server is retired
- [ ] Add `STRIPE_SECRET_KEY` (live account) and the webhook `https://www.fleeket.com/api/stripe/webhook` with its `STRIPE_WEBHOOK_SECRET`, turn on cancellations in the Stripe customer portal, then `npm run test:stripe`
- [ ] Configure SMTP: free-ad approvals and "your ad is live" emails depend on it
- [ ] Low-RAM build machine? `NEXT_BUILD_CPUS=2 pnpm build`
