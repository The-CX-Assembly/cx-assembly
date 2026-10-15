# The CX Assembly

> **Built by CX Leaders. For CX Leaders.** An initiative of The Executive Assembly.

The website for **The CX Assembly**, India's peer-led community for senior customer experience leaders, plus the admin dashboard that runs it. The same dashboard is a shared hub for other Executive Assembly websites: their leads and content are managed here too.

**Stack:** Next.js 16 (App Router) · TypeScript · Cloud Firestore · Firebase Storage & Auth · Firebase App Hosting.

## Quick start

```bash
nvm use                      # Node 22 (see .nvmrc)
npm install
cp .env.example .env.local   # then fill in ADMIN_SESSION_SECRET (see docs/DEVELOPMENT.md)
npm run dev                  # http://localhost:3000 · admin at /admin/login
```

Before opening a pull request: `npm run check` (lint, typecheck, unit tests).

## Environments

| | Production | Staging |
|---|---|---|
| Branch | `main` | `staging` |
| Firebase project | `the-cx-assembly` | `the-cx-assembly-staging` |
| Deploys | automatically when `main` changes | automatically when `staging` changes |
| Data | live leads and content | separate test data, never touches production |

Work flows `feature branch → staging → main`: check it on the staging site, then promote. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

| Doc | Read it to… |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | find your way around the code, the data model and how requests flow |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | set up your machine, run the app and the tests |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | release, roll back, hotfix, and the one-time staging / CI setup |
| [CONTRIBUTING.md](CONTRIBUTING.md) | branch naming, pull requests and code conventions |
