# Contributing

## Branches

| Branch | Purpose |
|---|---|
| `main` | Production. Changes arrive only by pull request from `staging` (or a hotfix). |
| `staging` | What's on the staging site. Feature work is merged here first. |
| `abhishek`, `vishakha` | Personal working branches. |
| `feat/…`, `fix/…`, `chore/…` | Short-lived branches for a single change (optional) |

Start from an up-to-date `staging`:

```bash
git checkout staging && git pull
git checkout -b feat/short-description     # or work on your personal branch
```

## Commits

Small and focused, with a clear message: `feat: …`, `fix: …`, `refactor: …`, `test: …`, `docs: …`, `chore: …`. Say *why* in the body when it isn't obvious.

## Pull requests

1. `npm run check` passes locally.
2. Open the PR into **`staging`** and fill in the template.
3. CI must be green. Fix failures rather than re-running.
4. After merging, check the change on the staging site. Releases to `main` are approved by the owner.

## Code conventions

- **Put code in its feature folder** (`src/features/<area>`). Pages in `src/app` stay thin. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- **Server-only code** (`server.ts`, anything using Firebase Admin) starts with `import 'server-only'` or lives under `src/server/`.
- **`'use server'` files** export only async functions. Put shared helpers elsewhere.
- **Admin actions** call `authorize(<section>)` first and take an explicit `siteId` (check it with `siteExists`).
- **Naming:** it's **speakers** in code, but the stored names are still `leaders` (collection, permission, site feature, upload folder). Don't rename stored values without a data migration.
- **Never claim success when a save failed.** Return an error the UI can show.
- **New environment variable?** Add it to `apphosting.yaml`, `apphosting.staging.yaml` (if it differs) and `.env.example`.
- **Tests:** logic changes get a unit test; user-facing flows get or keep a browser test.
- **Never commit secrets.** `.env*` files (except `.env.example`) are git-ignored.
