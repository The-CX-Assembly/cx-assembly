# Architecture

## Folder map

The code uses the familiar backend layers (config, middlewares, controllers, services, models, utils). App-wide pieces sit at the top of `src/`; everything about one area of the product (leads, speakers, media…) is a **module** with the same layers inside it, so working on Leads means opening one folder.

Next.js has no `routes/` folder or `app.js`/`server.js`: the folders under `src/app` *are* the routes, and Next.js starts the server.

```
src/
  app/                        Routes: pages and API URLs. Thin; they call controllers/services in modules/
    (site)/                   Public pages (route group: doesn't appear in URLs)
      page.tsx                  /
      founding-50/              /founding-50
      community-voices/         /community-voices
      privacy-policy/           /privacy-policy
      videos/, resources/       /videos, /resources (only when switched on in the admin)
    admin/                    Admin console, /admin/*
    api/v1/                   API for other websites (content, leads)
    api/resources/            Form-gated PDF downloads
    api/seed/                 One-off sample-data loader (super admins only)
    layout.tsx                <html>, fonts, site-wide metadata, structured data
    robots.ts, sitemap.ts

  config/                     Setup: Firebase Admin (server), Firebase web client (browser), environment
  middlewares/                Request guards: admin sign-in & permissions, website API keys & CORS
  utils/                      App-wide helpers: date formatting, cache refresh
  components/
    site/                     Public-site UI shared across pages (Navbar, Footer, hero art…)
    admin/                    Admin UI kit shared across modules (AdminShell, ui.tsx, Pagination, icons)
    EnvironmentBanner.tsx     "STAGING" badge

  modules/
    leads/                    Join form, campaign tracking, saving leads, the inbox
    speakers/                 CMO Speakers roster (public cards + admin editor)
    content/                  Page copy, site settings, content editors, defaults
    media/                    Videos (links + uploads) and form-gated PDFs
    sites/                    Multi-site hub: website registry, API keys, website switcher
    dashboard/                Admin dashboard stats and charts (Lead Sources, trends…)
    auth/                     Admin sign-in, section permissions
    users/                    Admin users & access management
    seo/                      Page metadata, structured data, Tag Manager

tests/
  unit/                       Vitest: pure logic
  e2e/                        Playwright: the real app in a browser
```

### Inside a module

Every module uses the same folders (only the ones it needs):

```
modules/leads/
  controllers/leads.actions.ts    Server actions: what forms and admin buttons call
  services/leads.service.ts       Business rules + database reads/writes
  models/lead.model.ts            Types (the shape of a lead)
  models/lead.schema.ts           Validation (zod)
  utils/attribution.ts            Helpers for this module only
  components/                     React components (JoinForm, LeadsManager…)
```

| Layer | What goes there | Rules |
|---|---|---|
| `controllers/*.actions.ts` | Server actions (`'use server'`) called from forms and the admin. Check access (`middlewares/auth.middleware.ts`), validate input, call a service, refresh pages. | Only async functions may be exported (a Next.js rule). |
| `services/*.service.ts` | Business logic and Firestore/Storage access. | Server-only: starts with `import 'server-only'`. |
| `models/*.model.ts`, `*.schema.ts`, `*.constants.ts` | Types, validation schemas, domain constants and defaults. | No database code; safe to import anywhere, including the browser. |
| `utils/` | Pure helpers used only by this module. | |
| `components/` | React components for this module. | |

Who may import what:

- `app/` (routes) → `modules/*`, `middlewares/`, `components/`, `config/`, `utils/`.
- A module → its own files (relative imports, `../services/…`) and other modules' **models, services and components** (`@/modules/…`), plus `config/`, `middlewares/`, `utils/`, `components/`.
- Browser components never import a `services/` file or `config/firebase-admin.ts` (`import type` is fine: types disappear at build time); `import 'server-only'` turns that mistake into a build error.

**Adding a new module** (e.g. events): create `src/modules/events/` with the folders above, add its admin page under `src/app/admin/events/` and its public pages under `src/app/(site)/`, and register the admin section in `modules/auth/models/access.model.ts`.

## Data model (Cloud Firestore)

| Collection | What | Notes |
|---|---|---|
| `leads` | Every form submission, from every website | `siteId` says which site; leads saved before multi-site support have none and belong to `cx-assembly`. `source` holds the button, pages, referrer and UTM tags. |
| `leaders` | CX Assembly's **CMO Speakers** | Called "speakers" everywhere in code. The collection keeps its original name, so no data migration was needed. |
| `voices` | Community Voices quotes | No admin editor; edit in the Firebase console. |
| `videos` | Videos (YouTube/Vimeo links or uploaded files) | `published` and `showOnHome` both default off. |
| `resources` | Downloadable PDFs | `storagePath` points into private Storage; `downloads` counts form-gated downloads. |
| `settings/media` | Master switches: home-page video section, `/videos`, `/resources` | All off until switched on under **Videos & PDFs → Where they appear**. |
| `siteContent/{section}` | CX Assembly page copy | Typed sections (hero, whyWeExist…), edited in Content Editor. |
| `settings/general` | CX Assembly SEO title, description, links | Edited in Settings. |
| `sites/{siteId}` | Registered websites | Name, URL, allowed origins, features, **hashed** API key. |
| `sites/{siteId}/{siteContent,leaders,settings}` | Content of other websites | Same shapes as CX Assembly's top-level collections. |
| `adminUsers/{email}` | Admin access | Role, sections, active. Built-in super admins are defined in `modules/users/services/users.service.ts`. |

Other names kept for the same reason as `leaders`: the admin permission key `'leaders'` (in `adminUsers.sections`), the site feature key `'leaders'` (in `sites.modules`) and the Storage folders `uploads/leaders`.

All server access goes through the Admin SDK (`src/config/firebase-admin.ts`), which bypasses security rules. `firestore.rules` / `storage.rules` only guard direct browser access.

## How requests flow

**Public pages** are server-rendered and cached, refreshing at most every 60 seconds. Saving in the admin refreshes the affected pages immediately (`utils/revalidate.ts`).

**A visitor applies:**
1. `modules/leads/utils/attribution.ts` records the campaign link, landing page and referrer when the visit starts (sessionStorage).
2. Any Join button opens `JoinModal`, tagged with the button's `source` (`hero`, `navbar`, …).
3. `JoinForm` posts to the `submitLead` action (`modules/leads/controllers/leads.actions.ts`), which validates it and saves it with `modules/leads/services/leads.service.ts`.
4. If saving fails, the visitor sees an error, never a false "Application received".

**Admin sign-in:** Firebase Auth (Google or email/password) in the browser, then `completeSignIn` verifies the ID token. If the email has access, the server sets a signed, HttpOnly session cookie (`middlewares/auth.middleware.ts`). Every admin page and action re-checks access, so removing a user takes effect immediately.

**Other websites** call `/api/v1/content` and `/api/v1/leads` with their API key (`x-api-key`), see `middlewares/api-key.middleware.ts`. The site a lead belongs to always comes from the key, never from the request body.

## Multi-site hub

- The **website switcher** (admin header) stores the selected site in a cookie (`modules/sites/services/admin-site.service.ts`). Content, Settings, Speakers and the Dashboard follow it; **All websites** combines leads and stats.
- Server actions receive the `siteId` explicitly and check it exists (`siteExists`), so a save always goes to the site the editor was opened for.
- CX Assembly (`DEFAULT_SITE_ID = 'cx-assembly'`) keeps its original top-level collections; other sites live under `sites/{siteId}/…` (`siteCollection()` picks the right one).

## Videos & PDFs

- **Nothing is public by default.** Each video/PDF has a *Live* switch, and the home-page video section, `/videos` and `/resources` each have a master switch (`settings/media`). Pages that are switched off return 404 and are left out of the sitemap.
- **Uploads go straight to Cloud Storage.** `startUpload` opens a resumable upload session for one object (tied to the admin page's origin); the browser PUTs the file there (`modules/media/utils/upload.ts`), then `finishUpload` checks type and size. This avoids App Hosting's 32 MB request limit (videos up to 500 MB, PDFs up to 50 MB).
- **Storage layout:** `uploads/**` is public (photos, videos, thumbnails); everything else, including `private/resources/**` (PDFs), is server-only (`storage.rules`).
- **PDFs are always form-gated.** `requestResource` saves the visitor as a lead (button `pdf-download`, the PDF in `extra`, plus campaign tags), then returns a link to `/api/resources/:id/download` signed for that PDF and valid 15 minutes; the route streams the private file and counts the download.
- **Players are click-to-play:** only a thumbnail loads until a visitor presses play (YouTube uses its privacy-enhanced domain).

## SEO

- `modules/seo/utils/metadata.ts`: `PAGES` lists the public pages. `pageMetadata()` builds title (`Page - The CX Assembly`), description, canonical URL, Open Graph / X tags and robots; `siteGraph()` / `pageGraph()` build the schema.org data.
- `NEXT_PUBLIC_SITE_URL` must be the domain that actually serves the site; every canonical link and preview is built from it.
- Share image: `public/brand/og-image.png` (1200×630). Icons: `public/brand/icons/`.
- Staging (`NEXT_PUBLIC_APP_ENV=staging`) is `noindex`, blocks all crawlers in robots.txt and never loads Tag Manager.
