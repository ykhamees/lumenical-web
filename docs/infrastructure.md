# API infrastructure (Phase 3.2)

**Status: not yet provisioned.** The API code (`api/`) is built and fully
tested against the local Firestore emulator (see `api/README.md`), but no
live GCP infrastructure exists for it yet — the owner deferred live
provisioning for this pass (2026-08-21) pending review. This document lists
exactly what Phase 3.2 needs to create, so provisioning is a checklist, not
a rediscovery exercise, whenever it happens (by the owner directly, or by an
agent given explicit go-ahead to provision live resources).

Project: `lumenical-ai` (same project the site's Firebase Hosting already
lives in). All resources below should be tagged/labeled so nothing here is
"created by hand and forgotten," per the build plan's own requirement.

## 1. Artifact Registry

A Docker repository to hold the API's container images.

```
gcloud artifacts repositories create lumenical-api \
  --repository-format=docker \
  --location=us-central1 \
  --project=lumenical-ai
```

## 2. Runtime service account

A dedicated service account for the Cloud Run service itself — **not** the
same `github-deployer` service account used for hosting deploys. Least
privilege: it needs to read/write the specific Firestore collections the
API touches (`leads`, `newsletterSubscribers`, `abuseCounters`,
`outboundEmails`) and nothing else `firestore.rules` reserves for the admin
console (`adminUsers`, `auditLog`, `chatSessions`, `demos`, `pages`,
`media` stay out of scope for this service account).

```
gcloud iam service-accounts create lumenical-api-runtime \
  --display-name="Lumenical API runtime" \
  --project=lumenical-ai

gcloud projects add-iam-policy-binding lumenical-ai \
  --member="serviceAccount:lumenical-api-runtime@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

`roles/datastore.user` is project-wide (Firestore doesn't support
collection-level IAM) — the actual per-collection boundary is enforced by
`firestore.rules` denying all client access and by this service account
being the only writer, not by IAM scoping alone. Document that trade-off
here rather than assuming it away.

## 3. Secret Manager

Two secrets, populated once the corresponding accounts exist (O-3, O-4):

```
gcloud secrets create turnstile-secret-key --project=lumenical-ai
gcloud secrets create resend-api-key --project=lumenical-ai

gcloud secrets add-iam-policy-binding turnstile-secret-key \
  --member="serviceAccount:lumenical-api-runtime@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding resend-api-key \
  --member="serviceAccount:lumenical-api-runtime@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 4. Cloud Run service

```
gcloud run deploy lumenical-api \
  --image=us-central1-docker.pkg.dev/lumenical-ai/lumenical-api/api:latest \
  --region=us-central1 \
  --platform=managed \
  --service-account=lumenical-api-runtime@lumenical-ai.iam.gserviceaccount.com \
  --min-instances=0 \
  --concurrency=80 \
  --memory=512Mi \
  --no-allow-unauthenticated \
  --set-secrets=TURNSTILE_SECRET_KEY=turnstile-secret-key:latest,RESEND_API_KEY=resend-api-key:latest \
  --project=lumenical-ai
```

`--no-allow-unauthenticated` because the only caller should be Firebase
Hosting's rewrite, which authenticates automatically — see
[Firebase's own docs on Cloud Run rewrites](https://firebase.google.com/docs/hosting/cloud-run)
for the exact invoker binding it needs (`roles/run.invoker` for Firebase
Hosting's service agent). `firebase.json`'s `hosting.rewrites` already
points `/api/**` at `serviceId: lumenical-api`, `region: us-central1` — if
either the service name or region changes here, update that file to match.

## 5. Workload Identity Federation for the API's own deploy workflow

`.github/workflows/deploy-api.yml` authenticates as
`lumenical-api-deployer@lumenical-ai.iam.gserviceaccount.com` — a
**separate** service account from the hosting deploy's `github-deployer`,
scoped to Artifact Registry push + Cloud Run deploy only, nothing else.
Mirror the existing hosting workflow's WIF pool
(`projects/577809123018/locations/global/workloadIdentityPools/github-actions/providers/github`)
rather than creating a second one; a new binding on the same pool, scoped
to this new service account, is enough.

```
gcloud iam service-accounts create lumenical-api-deployer \
  --display-name="Lumenical API GitHub deploy" \
  --project=lumenical-ai

gcloud projects add-iam-policy-binding lumenical-ai \
  --member="serviceAccount:lumenical-api-deployer@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding lumenical-ai \
  --member="serviceAccount:lumenical-api-deployer@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/run.developer"
gcloud iam service-accounts add-iam-policy-binding \
  lumenical-api-runtime@lumenical-ai.iam.gserviceaccount.com \
  --member="serviceAccount:lumenical-api-deployer@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Bind this SA to the existing WIF pool, scoped to this repo, matching
# whatever principalSet condition the hosting deploy's binding already uses.
gcloud iam service-accounts add-iam-policy-binding \
  lumenical-api-deployer@lumenical-ai.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/577809123018/locations/global/workloadIdentityPools/github-actions/attribute.repository/<owner>/<repo>"
```

## 6. Non-obvious operational notes

- **Cold starts**: `min-instances=0` means the first form submission after
  idle costs roughly 1-2s extra. Fine for a marketing-site's traffic
  volume; revisit only if that becomes a real complaint (real fix is
  `min-instances=1`, at a real, small monthly cost).
- **Firestore TTL**: `abuseCounters` documents are never explicitly
  deleted by this code — they accumulate. Configure a
  [Firestore TTL policy](https://cloud.google.com/firestore/docs/ttl) on
  the `expiresAt` field once this is live, so old rate-limit buckets get
  garbage-collected automatically instead of growing forever.
- **Observability** (Phase 3.8, also not yet done): structured logging,
  Cloud Monitoring alerts on 5xx rate/latency, and an uptime check on
  `/api/health` all need the service to exist first — sequence after this
  document's steps 1-4.
