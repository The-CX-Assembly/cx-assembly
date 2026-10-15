## What changed

<!-- One or two sentences. Link the task or screenshot if there is one. -->

## How it was checked

- [ ] `npm run check` passes locally (lint, typecheck, unit tests)
- [ ] Tried it in the browser (`npm run dev`)
- [ ] Screenshots attached for visible changes (desktop + mobile)

## Release

- [ ] Into `staging` first; promoted to `main` only after checking it on the staging site
- [ ] Needs a Firestore/Storage rules change (deployed automatically by the rules workflow)
- [ ] Needs a new environment variable or secret (added to `apphosting.yaml` / `apphosting.staging.yaml` and `.env.example`)
