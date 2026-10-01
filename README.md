# Fleeket

Marketing site, lead capture and content admin for **Fleeket** — a digital advertising and service‑discovery platform for Canada and the United States.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · MongoDB Atlas + Mongoose · Zod · Motion · Lenis (smooth scroll) · jose · Nodemailer

**Palette:** warm cream `#F7F6EC` · forest `#26352E` · soft olive `#D9E0C9` · lime `#D9F25A` (tokens in `app/globals.css`). Lime is used as a fill on forest; on cream, text accents use the darker moss `#56661C` for contrast.

## Quick start

```bash
npx pnpm install
cp .env.example .env.local   # then fill in MONGODB_URI, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npx pnpm dev
```

Open http://localhost:3000. On the first request with a database, the app **seeds itself** with the launch content (25 categories, 13 provinces/territories, FAQs, page copy, legal text) and creates the owner account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Sign in at `/login` → you land in `/admin`.

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
  (site)/          Public pages: home, services, services/[slug], how-it-works, pricing,
                   for-providers, for-customers, cities, cities/[slug], about, faq, contact,
                   privacy, terms, login, register, account
  admin/           Dashboard, leads, categories/cities/faqs ([resource]), pages, pricing,
                   legal, media, users, settings (content/[key])
  actions/         Server actions — public.ts (forms, auth) and admin.ts (all CMS writes)
  api/upload       POST image upload → MongoDB (admin only)
  api/uploads/…    GET image bytes from MongoDB with immutable caching
  api/admin/leads/export   CSV export
  sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
components/        site/ (public UI), home/, services/, forms/, admin/, ui/
lib/
  models.ts        Mongoose models: Category, City, Faq, Lead, User, Content, StoredUpload
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

## Images

Uploads never touch the filesystem (Vercel's is read-only). `POST /api/upload` checks the admin session, folder whitelist (`products | gallery | pages | misc`), MIME type, magic bytes and the 8 MB limit, then stores the bytes in the `StoredUpload` collection and returns `/api/uploads/<folder>/<filename>`. Only that URL is saved on content documents. Replacing or removing an image and saving deletes the old file. Legacy `/uploads/...` URLs fall back to `/placeholder.jpg`. Next/Image serves `/api/uploads/**` through `images.localPatterns`.

*Ceiling:* MongoDB documents max out at 16 MB, which is fine for web images up to 8 MB. If the media library grows large, move storage to S3/R2 behind the same `/api/upload` contract.

## Leads

Every form (contact, service request, provider listing) is validated with Zod on the server, rate-limited per IP, protected by a honeypot, stored as a `Lead` and, if SMTP is configured, emailed to the notification address. In `/admin/leads` you can filter, search, page through leads, change status (New → Contacted → Qualified → Converted / Closed / Spam) one at a time or in bulk, add notes and export CSV.

## Roles

`owner`, `admin` and `editor` can sign in to the admin. Editors manage content; only owners and admins manage users and site settings. `customer` and `provider` accounts are created through `/register`. Roles are always re-read from the database on each request; the session token is never trusted alone.

## Security notes

- scrypt password hashing (`node:crypto`), httpOnly + SameSite=Lax session cookies (Secure in production)
- Every server action and API route re-checks authorisation; `proxy.ts` is only a fast pre-check
- In-memory rate limiting on login, registration, forms and uploads. *Ceiling:* it is per serverless instance; move it to Upstash/Redis if abuse appears
- Regex search input is escaped; CSV export neutralises spreadsheet formulas; JSON-LD output escapes `<`

## Before launch

- [ ] Confirm what the **$9.99** fee covers and its currency (Admin → Pricing). JSON-LD `Offer` markup is only emitted once a currency is set
- [ ] Have counsel review the Privacy Policy and Terms (Admin → Legal); they were restructured from the previous site's policy
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live domain and configure SMTP
- [ ] Replace launch photography with Fleeket's own where available (Admin → Media library)
