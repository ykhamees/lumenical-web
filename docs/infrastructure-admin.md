# Admin console infrastructure

**Status: live**, provisioned 2026-08-22. This document now describes what
actually exists, not a checklist — kept for anyone who needs to reproduce or
extend it. Project: `lumenical-web` (same project as the site's Firebase
Hosting and the `api/` Cloud Run service), region `me-central1` throughout
(matching where this project's Firestore database already lives — not
`us-central1`, which earlier drafts of this doc assumed before that was
checked against reality).

**Migrated 2026-08-26** from the original `lumenical-ai` project — every
resource below was recreated under `lumenical-web` with identical names;
the `lumenical-ai` copies have been decommissioned (their Firestore data
was verified present under `lumenical-web` first).

**Not a subdomain.** `admin/` is served at `lumenical.com/website/**` via a
`firebase.json` Hosting rewrite to the `lumenical-admin` Cloud Run service —
not its own subdomain. This project's GCP org already runs a separate,
unrelated product (`ykhamees/lumenical-ai-platform`, nginx + Keycloak) with
its own routing conventions; keeping this app under a path prefix on the
existing domain, with `basePath: "/website"` in `admin/next.config.mjs`,
avoids any ambiguity about which app owns what. See `admin/src/lib/
base-path.ts` — Next's `basePath` prefixes page routing and `next/link`
automatically, but plain `fetch()` calls (this app's own `/api/**` proxy
calls, `next/image`-style) need it added manually, which is what that
constant is for.

## 1. Artifact Registry

```
gcloud artifacts repositories create lumenical-admin \
  --repository-format=docker \
  --location=me-central1 \
  --project=lumenical-web
```

## 2. Runtime service account

Named `lumenical-admin` (not `-runtime` — matching the API's own existing
`lumenical-api` service account, created before this doc's first draft, in
a plain `<product>` naming convention rather than `<product>-runtime`).

```
gcloud iam service-accounts create lumenical-admin \
  --display-name="Lumenical admin console runtime" \
  --project=lumenical-web
```

Two grants, both narrower than the API's own runtime service account — this
app never touches Firestore directly, only through the proxied Python API:

- **`roles/run.invoker` on the `lumenical-api` Cloud Run service** (not
  project-wide) — lets `admin/src/app/api/[...path]/route.ts`'s proxy call
  the API service-to-service:

  ```
  gcloud run services add-iam-policy-binding lumenical-api \
    --region=me-central1 \
    --member="serviceAccount:lumenical-admin@lumenical-web.iam.gserviceaccount.com" \
    --role="roles/run.invoker" \
    --project=lumenical-web
  ```

- **`roles/firebaseauth.admin`** — needed for `firebase-admin`'s
  `createSessionCookie` / `verifySessionCookie` calls in `src/lib/session.ts`:

  ```
  gcloud projects add-iam-policy-binding lumenical-web \
    --member="serviceAccount:lumenical-admin@lumenical-web.iam.gserviceaccount.com" \
    --role="roles/firebaseauth.admin"
  ```

## 3. Cloud Run service

```
gcloud run deploy lumenical-admin \
  --image=me-central1-docker.pkg.dev/lumenical-web/lumenical-admin/admin:<tag> \
  --region=me-central1 \
  --platform=managed \
  --service-account=lumenical-admin@lumenical-web.iam.gserviceaccount.com \
  --min-instances=0 \
  --concurrency=80 \
  --memory=512Mi \
  --allow-unauthenticated \
  --set-env-vars=ADMIN_API_BASE_URL=<lumenical-api's Cloud Run URL> \
  --project=lumenical-web
```

`--allow-unauthenticated` is deliberate, not a downgrade from the API's own
`--no-allow-unauthenticated` — this service is the thing a browser talks to
directly (no Firebase-Hosting-style automatic invoker grant exists for a
bare Cloud Run URL), so app-level auth (the session cookie + `src/proxy.ts`,
and the API's own bearer-token check) is what actually protects it, the
same way Firebase Hosting never authenticated visitors either.

**The `NEXT_PUBLIC_FIREBASE_*` vars are build-time, not runtime.** They get
inlined into the client bundle when the Docker image is built (`admin/
Dockerfile`'s `ARG`/`ENV` lines), *not* read from the deployed service's
environment — pass them as `--build-arg` to `docker build`, using the
Firebase web app's public API key (`gcloud alpha services api-keys
get-key-string <key-resource-name>` — Firebase auto-creates a "Browser key"
per project) and `<project-id>.firebaseapp.com` as the auth domain.

### Path routing (not a domain mapping)

`firebase.json`'s `hosting.rewrites` sends `/website/**` to this service,
alongside the existing `/api/**` → `lumenical-api` rewrite:

```json
{
  "source": "/website/**",
  "run": { "serviceId": "lumenical-admin", "region": "me-central1" }
}
```

Deploying this (`firebase deploy --only hosting`) is what makes
`lumenical.com/website/` live — Firebase Hosting auto-grants its own service
agent `roles/run.invoker` on the target service the first time a rewrite to
it is deployed (that identity doesn't exist beforehand, so granting it by
hand ahead of time fails with "service account does not exist" — confirmed
empirically). No domain mapping, no DNS record, no separate TLS cert.

## 4. Workload Identity Federation for the admin app's own deploy workflow

`.github/workflows/deploy-admin.yml` authenticates as
`lumenical-admin-deployer@lumenical-web.iam.gserviceaccount.com` — a
**separate** service account from both `github-deployer` (hosting) and
`lumenical-api-deployer` (the API), scoped to this repo's Artifact Registry
push + this one Cloud Run service's deploy, nothing else. Mirrors the
existing hosting/API workflows' WIF pool rather than creating a second one.

```
gcloud iam service-accounts create lumenical-admin-deployer \
  --display-name="Lumenical admin console GitHub deploy" \
  --project=lumenical-web

gcloud projects add-iam-policy-binding lumenical-web \
  --member="serviceAccount:lumenical-admin-deployer@lumenical-web.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding lumenical-web \
  --member="serviceAccount:lumenical-admin-deployer@lumenical-web.iam.gserviceaccount.com" \
  --role="roles/run.developer"
gcloud iam service-accounts add-iam-policy-binding \
  lumenical-admin@lumenical-web.iam.gserviceaccount.com \
  --member="serviceAccount:lumenical-admin-deployer@lumenical-web.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud iam service-accounts add-iam-policy-binding \
  lumenical-admin-deployer@lumenical-web.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/653525125040/locations/global/workloadIdentityPools/github-actions/attribute.repository/ykhamees/lumenical-web"
```

`deploy-admin.yml`'s own deploy step also fetches `lumenical-api`'s current
URL at deploy time (`gcloud run services describe lumenical-api --format=
'value(status.url)'`) and passes it as `ADMIN_API_BASE_URL`, rather than
hardcoding it — `roles/run.developer` already covers reading another
service's URL in the same project.

## 5. Non-obvious operational notes

- **The `Authorization`-header collision — resolved, and differently than
  first designed.** `admin/src/app/api/[...path]/route.ts` sends *two*
  different bearer tokens to the API on the same request: a Cloud-Run-IAM
  identity token (audience-scoped to `lumenical-api`, proving "this call
  came from the admin service") and the end user's Firebase ID token (which
  `api/app/auth.py`'s `require_admin_user` verifies). Cloud Run's IAM
  invoker check reads the **standard `Authorization` header** for the
  identity token — confirmed against live infrastructure; an earlier draft
  of this design assumed an `X-Serverless-Authorization` alternate header
  existed for exactly this dual-auth case, but that assumption was wrong
  (Cloud Run rejected the call outright, logged as "Empty Authorization
  header value"). The fix: the identity token goes in `Authorization` as
  Cloud Run expects, and the Firebase user token travels in a custom
  `X-Firebase-Id-Token` header instead — `api/app/auth.py`'s
  `require_admin_user` reads *that* header, not `Authorization`. Since
  `/api/admin/**` is only ever called by this proxy now (never directly by
  a browser, never through Firebase Hosting), this was a clean swap with no
  backward-compatibility concern.
- **A second real bug caught the same way**: `google-auth-library`'s
  `getRequestHeaders()` returns a capitalized `Authorization` key, not
  lowercase `authorization` — a plain-object property lookup is
  case-sensitive, so the first version of this fix still silently sent no
  identity token at all (same symptom, same Cloud Run log line) until that
  casing was corrected too.
- **Cold starts**: `min-instances=0` adds roughly 1-2s to the first login
  after idle. Acceptable for an internal console; `min-instances=1` is the
  fix if that becomes annoying, at a small real monthly cost.
- **Session cookie lifetime**: 5 days (`SESSION_MAX_AGE_SECONDS` in
  `src/lib/session.ts`), refreshed on every Firebase ID token refresh while
  a tab stays open. A user who closes their laptop for a week signs in
  again — deliberate, not a bug.
- **Firestore/Storage rules deploy** (`firebase deploy --only
  firestore:rules,firestore:indexes,storage`) and the `/website/**` Hosting
  rewrite both need the `firebase` CLI re-authenticated on whatever machine
  runs them — `gcloud` and `firebase` are separate credential stores, and
  only `gcloud` was re-authenticated in this pass.
