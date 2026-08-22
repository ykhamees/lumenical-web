# Admin console infrastructure

**Status: not yet provisioned.** The admin app (`admin/`) is built and
lint/type-check/build clean, but no live GCP infrastructure exists for it
yet, matching `api/`'s current state (see `docs/infrastructure.md`). This
document lists exactly what's needed, so provisioning is a checklist, not a
rediscovery exercise, whenever it happens (by the owner directly, or by an
agent given explicit go-ahead to provision live resources).

Project: `lumenical-ai` (same project as the site's Firebase Hosting and the
`api/` Cloud Run service).

## 1. Artifact Registry

A separate Docker repository from the API's own `lumenical-api` repo — keeps
the two deployables' images and IAM fully independent.

```
gcloud artifacts repositories create lumenical-admin \
  --repository-format=docker \
  --location=us-central1 \
  --project=lumenical-ai
```

## 2. Runtime service account

```
gcloud iam service-accounts create lumenical-admin-runtime \
  --display-name="Lumenical admin console runtime" \
  --project=lumenical-ai
```

Two grants, both narrower than the API's own runtime service account
(`lumenical-api-runtime`, see `docs/infrastructure.md`) — this app never
touches Firestore directly, only through the proxied Python API:

- **`roles/run.invoker` on the `lumenical-api` Cloud Run service** (not
  project-wide) — lets `src/app/api/admin/[...path]/route.ts`'s proxy call
  the API service-to-service:

  ```
  gcloud run services add-iam-policy-binding lumenical-api \
    --region=us-central1 \
    --member="serviceAccount:lumenical-admin-runtime@lumenical-ai.iam.gserviceaccount.com" \
    --role="roles/run.invoker" \
    --project=lumenical-ai
  ```

- **`roles/firebaseauth.admin`** — needed for `firebase-admin`'s
  `createSessionCookie` / `verifySessionCookie` calls in `src/lib/session.ts`:

  ```
  gcloud projects add-iam-policy-binding lumenical-ai \
    --member="serviceAccount:lumenical-admin-runtime@lumenical-ai.iam.gserviceaccount.com" \
    --role="roles/firebaseauth.admin"
  ```

## 3. Cloud Run service

```
gcloud run deploy lumenical-admin \
  --image=us-central1-docker.pkg.dev/lumenical-ai/lumenical-admin/admin:latest \
  --region=us-central1 \
  --platform=managed \
  --service-account=lumenical-admin-runtime@lumenical-ai.iam.gserviceaccount.com \
  --min-instances=0 \
  --concurrency=80 \
  --memory=512Mi \
  --allow-unauthenticated \
  --set-env-vars=ADMIN_API_BASE_URL=<lumenical-api's Cloud Run URL>,NEXT_PUBLIC_FIREBASE_API_KEY=...,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...,NEXT_PUBLIC_FIREBASE_PROJECT_ID=... \
  --project=lumenical-ai
```

`--allow-unauthenticated` here is deliberate and not a downgrade from the
API's own `--no-allow-unauthenticated` — this service is the thing a
browser talks to directly (no Firebase-Hosting-style automatic invoker
grant is available for a bare Cloud Run domain mapping), so app-level auth
(the session cookie + `src/proxy.ts`, and the API's own bearer-token check)
is what actually protects it, the same way Firebase Hosting never
authenticated visitors either.

### Domain mapping

```
gcloud run domain-mappings create \
  --service=lumenical-admin \
  --domain=web-admin.lumenical.com \
  --region=us-central1 \
  --project=lumenical-ai
```

Add the DNS record this command outputs (a CNAME, typically) at whatever
registrar/DNS host manages `lumenical.com` — outside this repo's control.

## 4. Workload Identity Federation for the admin app's own deploy workflow

`.github/workflows/deploy-admin.yml` authenticates as
`lumenical-admin-deployer@lumenical-ai.iam.gserviceaccount.com` — a
**separate** service account from both `github-deployer` (hosting) and
`lumenical-api-deployer` (the API), scoped to this repo's Artifact Registry
push + this one Cloud Run service's deploy, nothing else. Mirrors the
existing hosting/API workflows' WIF pool rather than creating a second one.

```
gcloud iam service-accounts create lumenical-admin-deployer \
  --display-name="Lumenical admin console GitHub deploy" \
  --project=lumenical-ai

gcloud projects add-iam-policy-binding lumenical-ai \
  --member="serviceAccount:lumenical-admin-deployer@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding lumenical-ai \
  --member="serviceAccount:lumenical-admin-deployer@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/run.developer"
gcloud iam service-accounts add-iam-policy-binding \
  lumenical-admin-runtime@lumenical-ai.iam.gserviceaccount.com \
  --member="serviceAccount:lumenical-admin-deployer@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud iam service-accounts add-iam-policy-binding \
  lumenical-admin-deployer@lumenical-ai.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/577809123018/locations/global/workloadIdentityPools/github-actions/attribute.repository/<owner>/<repo>"
```

## 5. Non-obvious operational notes

- **The `Authorization`-header collision, and why `X-Serverless-Authorization`
  is used instead.** `src/app/api/admin/[...path]/route.ts` needs to send
  *two* different bearer tokens to the API on the same request: a
  Cloud-Run-IAM identity token (audience-scoped to `lumenical-api`, proving
  "this call came from the admin service") and the end user's Firebase ID
  token (which `api/app/auth.py`'s `require_admin_user` verifies). Cloud
  Run's IAM invoker check is hard-wired to read the standard `Authorization`
  header, which would otherwise clobber the Firebase token the Python API
  also expects there. The proxy route instead sends the Cloud Run identity
  token via `X-Serverless-Authorization` — Cloud Run's own documented
  alternate location for exactly this "the app needs its own Authorization
  header" case — and forwards the browser's original `Authorization: Bearer
  <firebase-id-token>` untouched. **Verify this header name against current
  Google Cloud Run docs before this is ever wired to a real
  `--no-allow-unauthenticated` service** — it's the one part of this design
  not exercised against live infrastructure yet.
- **Cold starts**: `min-instances=0` adds roughly 1-2s to the first login
  after idle. Acceptable for an internal console; `min-instances=1` is the
  fix if that becomes annoying, at a small real monthly cost.
- **Session cookie lifetime**: 5 days (`SESSION_MAX_AGE_SECONDS` in
  `src/lib/session.ts`), refreshed on every Firebase ID token refresh while
  a tab stays open. A user who closes their laptop for a week signs in
  again — deliberate, not a bug.
