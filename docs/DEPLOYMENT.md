# Deployment

## Environments

| | Production | Staging |
|---|---|---|
| Branch | `main` | `staging` |
| Firebase project | `the-cx-assembly` | `the-cx-assembly-staging` |
| App Hosting backend | `cx-assembly` (us-east4) | `cx-assembly-staging`, environment name **`staging`** |
| Config | `apphosting.yaml` | `apphosting.yaml` + `apphosting.staging.yaml` |
| URL | https://cx-assembly--the-cx-assembly.us-east4.hosted.app | see `apphosting.staging.yaml` |
| Search engines | indexed | blocked (`noindex`, robots.txt) |

Staging has its own database, storage, sign-in users and secrets. Nothing done on staging can affect the live site.

## How a change goes live

```
feature branch ──PR──▶ staging ──auto-deploy──▶ staging site ──check──▶ PR staging → main ──auto-deploy──▶ production
```

1. **Open a PR into `staging`.** CI must pass (lint, typecheck, unit and browser tests).
2. **Merge.** App Hosting builds and deploys staging automatically (about 5 minutes; Firebase console → App Hosting → Rollouts).
3. **Check the staging site.** Optionally run *Actions → Smoke test a deployed site → staging*.
4. **Open a PR from `staging` into `main`.** The owner approves it.
5. **Merge.** Production deploys automatically. Run the smoke test against **production**.

If the change touches `firestore.rules`, `storage.rules` or `firestore.indexes.json`, the **Deploy Firestore & Storage rules** workflow ships them to the matching project when the branch is updated. The production run waits for approval.

### Hotfix

Branch from `main`, fix, open a PR into **`main`** (CI and approval as usual), then merge `main` back into `staging` so the fix isn't lost on the next release.

### Rollback

- **Fastest:** Firebase console → App Hosting → *backend* → Rollouts → pick the last good rollout → **Roll back**. Live within a minute or two.
- **Then:** revert the bad commit on `main` (`git revert <sha>`, PR, merge) so the next deploy doesn't bring it back.

### Manual deploy (only if automatic rollouts are off)

```bash
firebase apphosting:rollouts:create cx-assembly --git-branch main --project the-cx-assembly
```

## Secrets and settings

| What | Where |
|---|---|
| `ADMIN_SESSION_SECRET` | Secret Manager in **each** project (different values): `firebase apphosting:secrets:set ADMIN_SESSION_SECRET --project <project>` |
| Public settings (`NEXT_PUBLIC_*`) | `apphosting.yaml` (production) and `apphosting.staging.yaml` (staging overrides) |
| New variable | Add to both YAML files and `.env.example` |

---

## One-time setup

Done once; kept here so it can be repeated or audited.

### 1. Staging Firebase project

1. Create a project **`the-cx-assembly-staging`** and upgrade it to **Blaze** (App Hosting requires it; staging traffic costs close to nothing).
2. **Firestore**: create the default database, Native mode, location **nam5** (same as production).
3. **Storage**: create the default bucket.
4. **Authentication** → Sign-in method: enable **Google** and **Email/Password**. Authorized domains: add the staging App Hosting domain.
5. **Project settings → Your apps**: add a **Web app**. Copy its config into `apphosting.staging.yaml` (`APP_ID`, `API_KEY`, `MESSAGING_SENDER_ID`).
6. Session secret: `firebase apphosting:secrets:set ADMIN_SESSION_SECRET --project the-cx-assembly-staging` (a new random value).
7. Rules: `firebase deploy --only firestore,storage --project staging`.

### 2. Staging App Hosting backend

Firebase console (staging project) → App Hosting → Create backend:
- Repository `The-CX-Assembly/cx-assembly`, root `/`, **live branch `staging`**, automatic rollouts **on**, region us-east4.
- Backend → Settings → **Environment name: `staging`**. Without this the backend would use production settings.
- Put the backend URL into `NEXT_PUBLIC_SITE_URL` in `apphosting.staging.yaml`.
- Grant the backend access to the secret: `firebase apphosting:secrets:grantaccess ADMIN_SESSION_SECRET --backend cx-assembly-staging --project the-cx-assembly-staging`.

Production backend: make sure **automatic rollouts are on** for live branch `main` (Backend → Settings → Deployment).

### 3. GitHub Actions access to Google Cloud (keyless)

For **each** project, in [Cloud Shell](https://shell.cloud.google.com):

```bash
PROJECT_ID=the-cx-assembly-staging   # then repeat with the-cx-assembly
REPO=The-CX-Assembly/cx-assembly
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

gcloud iam workload-identity-pools create github --project=$PROJECT_ID --location=global --display-name="GitHub Actions"
gcloud iam workload-identity-pools providers create-oidc github --project=$PROJECT_ID --location=global \
  --workload-identity-pool=github --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='$REPO'"

gcloud iam service-accounts create github-deployer --project=$PROJECT_ID --display-name="GitHub Actions deployer"
SA=github-deployer@$PROJECT_ID.iam.gserviceaccount.com
for ROLE in roles/firebaserules.admin roles/datastore.indexAdmin roles/firebase.viewer roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA" --role=$ROLE --condition=None
done
gcloud iam service-accounts add-iam-policy-binding $SA --project=$PROJECT_ID --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO"

echo "GCP_WORKLOAD_IDENTITY_PROVIDER = projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github"
echo "GCP_SERVICE_ACCOUNT            = $SA"
```

### 4. GitHub settings

**Environments** (Settings → Environments): create `staging` and `production`, each with variables:

| Variable | staging | production |
|---|---|---|
| `FIREBASE_PROJECT_ID` | `the-cx-assembly-staging` | `the-cx-assembly` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | from step 3 | from step 3 |
| `GCP_SERVICE_ACCOUNT` | from step 3 | from step 3 |
| `SITE_URL` | staging URL | production URL |

On `production`, add **Required reviewers: the owner**.

**Branch rules** (Settings → Rules → Rulesets):

- **`main`**: require a pull request with **1 approval** and **Code Owners review**. Required status checks: *Lint, typecheck & unit tests* and *Build & browser tests*. Block force pushes and deletion. Add the owner to the **bypass list**, so the owner can merge their own PRs (GitHub doesn't let authors approve their own).
- **`staging`**: require a pull request and the same two status checks (no approval needed). Block force pushes and deletion.
