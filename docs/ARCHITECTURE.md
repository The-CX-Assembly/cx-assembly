# Architecture

## Folder map

Code is grouped by **feature**: everything about one area (its database code, server actions and UI) lives in one folder.

```
src/
  app/                        Routes only: thin pages that call into features/
    (site)/                   Public pages (route group: doesn't appear in URLs)
      page.tsx                  /
      founding-50/              /founding-50
      community-voices/         /community-voices
      privacy-policy/           /privacy-policy
    admin/                    Admin console, /admin/*
    api/v1/                   API for other websites (content, leads)
    api/seed/                 One-off sample-data loader (super admins only)
    layout.tsx                <html>, fonts, site-wide metadata, structured data
    robots.ts, sitemap.ts

  features/
    leads/                    Join form, campaign tracking, saving leads, the inbox
    speakers/                 CMO Speakers roster (public cards + admin editor)
    content/                  Page copy, site settings, content editors, defaults
    sites/                    Multi-site hub: website registry, API keys, switcher, public API auth
    dashboard/                Admin dashboard stats and charts (Lead Sources, trends…)
    auth/                     Admin sign-in, session cookies, section permissions
    users/                    Admin users & access management
    seo/                      Page metadata, structured data, Tag Manager

  components/
    site/                     Public-site UI shared across pages (Navbar, Footer, hero art…)
    admin/                    Admin UI shared across features (AdminShell, Pagination, icons)
    EnvironmentBanner.tsx     "STAGING" badge

  server/                     Server-only infrastructure: Firebase Admin, cache revalidation
  lib/                        Shared helpers safe in the browser (env, Firebase web client)
  types/                      Shared TypeScript types

tests/
  unit/                       Vitest: pure logic
  e2e/                        Playwright: the real app in a browser
```

### Inside a feature folder

| File | What goes there |
|---|---|
| `server.ts` | Database reads/writes. Server-only. |
| `actions.ts` | Server actions (`'use server'`) called from forms and admin UI. Only async functions may be exported. |
| `components/` | React components for this feature. |
| other `*.ts` | Feature helpers, e.g. `leads/validation.ts`, `sites/constants.ts`. |

Rule of thumb: a page in `src/app` imports from `features/*`; features may import from each other, from `components/`, `server/` and `lib/`.

## Data model (Cloud Firestore)

| Collection | What | Notes |
|---|---|---|
| `leads` | Every form submission, from every website | `siteId` says which site; leads saved before multi-site support have none and belong to `cx-assembly`. `source` holds the button, pages, referrer and UTM tags. |
| `leaders` | CX Assembly's **CMO Speakers** | Called "speakers" everywhere in code. The collection keeps its original name, so no data migration was needed. |
| `voices` | Community Voices quotes | No admin editor; edit in the Firebase console. |
| `siteContent/{section}` | CX Assembly page copy | Typed sections (hero, whyWeExist…), edited in Content Editor. |
| `settings/general` | CX Assembly SEO title, description, links | Edited in Settings. |
| `sites/{siteId}` | Registered websites | Name, URL, allowed origins, features, **hashed** API key. |
| `sites/{siteId}/{siteContent,leaders,settings}` | Content of other websites | Same shapes as CX Assembly's top-level collections. |
| `adminUsers/{email}` | Admin access | Role, sections, active. Built-in super admins are defined in `features/users/server.ts`. |

Other names kept for the same reason as `leaders`: the admin permission key `'leaders'` (in `adminUsers.sections`), the site feature key `'leaders'` (in `sites.modules`) and the Storage folders `uploads/leaders`.

All server access goes through the Admin SDK (`src/server/firebase-admin.ts`), which bypasses security rules. `firestore.rules` / `storage.rules` only guard direct browser access.

## How requests flow

**Public pages** are server-rendered and cached, refreshing at most every 60 seconds. Saving in the admin refreshes the affected pages immediately (`server/revalidate.ts`).

**A visitor applies:**
1. `features/leads/attribution.ts` records the campaign link, landing page and referrer when the visit starts (sessionStorage).
2. Any Join button opens `JoinModal`, tagged with the button's `source` (`hero`, `navbar`, …).
3. `JoinForm` posts to the `submitLead` server action, which validates it and saves it with `features/leads/server.ts`.
4. If saving fails, the visitor sees an error, never a false "Application received".

**Admin sign-in:** Firebase Auth (Google or email/password) in the browser, then `completeSignIn` verifies the ID token. If the email has access, the server sets a signed, HttpOnly session cookie (`features/auth/session.ts`). Every admin page and action re-checks access, so removing a user takes effect immediately.

**Other websites** call `/api/v1/content` and `/api/v1/leads` with their API key (`x-api-key`), see `features/sites/public-api.ts`. The site a lead belongs to always comes from the key, never from the request body.

## Multi-site hub

- The **website switcher** (admin header) stores the selected site in a cookie (`features/sites/admin-site.ts`). Content, Settings, Speakers and the Dashboard follow it; **All websites** combines leads and stats.
- Server actions receive the `siteId` explicitly and check it exists (`siteExists`), so a save always goes to the site the editor was opened for.
- CX Assembly (`DEFAULT_SITE_ID = 'cx-assembly'`) keeps its original top-level collections; other sites live under `sites/{siteId}/…` (`siteCollection()` picks the right one).

## SEO

- `features/seo/metadata.ts`: `PAGES` lists the public pages. `pageMetadata()` builds title (`Page - The CX Assembly`), description, canonical URL, Open Graph / X tags and robots; `siteGraph()` / `pageGraph()` build the schema.org data.
- `NEXT_PUBLIC_SITE_URL` must be the domain that actually serves the site; every canonical link and preview is built from it.
- Share image: `public/brand/og-image.png` (1200×630). Icons: `public/brand/icons/`.
- Staging (`NEXT_PUBLIC_APP_ENV=staging`) is `noindex`, blocks all crawlers in robots.txt and never loads Tag Manager.
