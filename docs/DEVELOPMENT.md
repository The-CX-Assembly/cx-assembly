# Development

## Prerequisites

- **Node 22**: `nvm use` picks it up from `.nvmrc` (Node 20.9+ also works).
- **Google Chrome**: the browser tests use it locally.
- Optional: **Java 21**, only to run the Firestore emulator yourself (CI does this for you).

## First-time setup

```bash
npm install
cp .env.example .env.local
```

In `.env.local`:

1. **`ADMIN_SESSION_SECRET`**: any 32+ random characters:
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
2. **Database access (optional but recommended)**: point at **staging, never production**.
   - Set the `NEXT_PUBLIC_FIREBASE_*` values and `FIREBASE_PROJECT_ID` to the staging project (values in `apphosting.staging.yaml`).
   - Give the server credentials, either:
     - `gcloud auth application-default login` with an account that has access to the staging project, or
     - a staging service-account key in `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`.

Without database access the site runs on built-in sample content, nothing is saved, and only the built-in super admins can sign in.

## Running the app

```bash
npm run dev        # http://localhost:3000
```

Admin: http://localhost:3000/admin/login.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run check` | Lint + typecheck + unit tests; run before every PR |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates Next.js route types, then `tsc` |
| `npm test` | Unit tests (Vitest), `tests/unit` |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | Browser tests (Playwright) against `npm run dev` |
| `npm run test:e2e:ci` | Browser tests against a Firestore emulator (what CI runs; needs Java) |
| `npm run format` | Prettier: format files you've touched (`npx prettier --write <files>`) |

## Tests

- **Unit tests** (`tests/unit/*.test.ts`) cover logic that can break quietly: validation, campaign attribution, Lead Sources grouping, SEO tags, pagination, staging safeguards. Add one when you change logic in `features/*`.
- **Browser tests** (`tests/e2e/*.spec.ts`) drive the real app. Locally they reuse a running `npm run dev` (or start one) and use your installed Chrome. Admin tests sign in with a cookie signed by your `ADMIN_SESSION_SECRET`.
  - The "lead reaches the inbox" test needs a database, so it is skipped locally and runs in CI.
  - Tests tagged `@smoke` are read-only and also run against deployed sites (`PLAYWRIGHT_BASE_URL=<url> npx playwright test --grep @smoke`).

## Troubleshooting

- **Pages reload over and over in dev**: the dev server got stuck (e.g. after a merge conflict). Stop it and run `npm run dev` again.
- **Type errors mentioning `.next/…/validator.ts`** after moving pages: stale generated types. `npm run typecheck` regenerates them; or delete `.next/types` and `.next/dev/types`.
- **Admin pages are slow locally in production mode** (`npm start` without credentials): Firebase looks for Google Cloud credentials and times out on each call. Use `npm run dev`, or set up credentials as above.
