# API infrastructure (Phase 3.2)

**Status: live**, provisioned 2026-08-22, region `me-central1` (matching
where this project's Firestore database already lives, not `us-central1` as
earlier drafts of this doc assumed). This document now describes what
actually exists, not a checklist — kept for anyone who needs to reproduce
or extend it.

Project: `lumenical-ai` (same project the site's Firebase Hosting already
lives in).

## 1. Artifact Registry

```
gcloud artifacts repositories create lumenical-api \
  --repository-format=docker \
  --location=me-central1 \
  --project=lumenical-ai
```

## 2. Runtime service account

`lumenical-api@lumenical-ai.iam.gserviceaccount.com` — created before this
document's first draft (predates this pass), already carrying:

```
roles/datastore.user
roles/secretmanager.secretAccessor
```

`roles/datastore.user` is project-wide (Firestore doesn't support
collection-level IAM) — the actual per-collection boundary is enforced by
`firestore.rules` denying all client access and by this service account
being the only writer, not by IAM scoping alone. Document that trade-off
here rather than assuming it away.

## 3. Secret Manager

**Not created yet, deliberately.** Turnstile and Resend accounts don't
exist yet (owner's call, 2026-08-22) — the API runs today with both env
vars unset, which its own code already treats as "skip this integration"
(`api/app/config.py`). When those accounts exist:

```
gcloud secrets create turnstile-secret-key --project=lumenical-ai
gcloud secrets create resend-api-key --project=lumenical-ai

gcloud secrets add-iam-policy-binding turnstile-secret-key \
  --member="serviceAccount:lumenical-api@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding resend-api-key \
  --member="serviceAccount:lumenical-api@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

then redeploy with `--update-secrets=TURNSTILE_SECRET_KEY=turnstile-secret-key:latest,RESEND_API_KEY=resend-api-key:latest`.

## 4. Cloud Run service

```
gcloud run deploy lumenical-api \
  --image=me-central1-docker.pkg.dev/lumenical-ai/lumenical-api/api:<tag> \
  --region=me-central1 \
  --platform=managed \
  --service-account=lumenical-api@lumenical-ai.iam.gserviceaccount.com \
  --min-instances=0 \
  --concurrency=80 \
  --memory=512Mi \
  --no-allow-unauthenticated \
  --project=lumenical-ai
```

Deployed today with no `--set-secrets` (see §3). `--no-allow-unauthenticated`
because the only legitimate callers are Firebase Hosting's `/api/**` rewrite
and the admin app's own server-to-server proxy — see
[Firebase's own docs on Cloud Run rewrites](https://firebase.google.com/docs/hosting/cloud-run)
for the invoker binding Hosting grants itself automatically (confirmed: that
service agent identity doesn't exist until the *first* Hosting deploy with a
rewrite to a given service actually runs — granting it by hand ahead of time
fails with "service account does not exist"). The admin app's own runtime
service account (`lumenical-admin`) has its own explicit `run.invoker`
grant on this service — see `docs/infrastructure-admin.md` §2 — and sends
its identity token via the standard `Authorization` header (not a
alternate header — see that doc's §5 for a design assumption that turned
out to be wrong, corrected there).

`firebase.json`'s `hosting.rewrites` points `/api/**` at `serviceId:
lumenical-api`, `region: me-central1` — if either the service name or
region changes here, update that file to match.

## 5. Workload Identity Federation for the API's own deploy workflow

`.github/workflows/deploy-api.yml` authenticates as
`lumenical-api-deployer@lumenical-ai.iam.gserviceaccount.com` — a
**separate** service account from the hosting deploy's `github-deployer`,
scoped to Artifact Registry push + Cloud Run deploy only, nothing else.

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
  lumenical-api@lumenical-ai.iam.gserviceaccount.com \
  --member="serviceAccount:lumenical-api-deployer@lumenical-ai.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud iam service-accounts add-iam-policy-binding \
  lumenical-api-deployer@lumenical-ai.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/577809123018/locations/global/workloadIdentityPools/github-actions/attribute.repository/ykhamees/lumenical-web"
```

## 6. Non-obvious operational notes

- **Cold starts**: `min-instances=0` means the first form submission after
  idle costs roughly 1-2s extra. Fine for a marketing-site's traffic
  volume; revisit only if that becomes a real complaint (real fix is
  `min-instances=1`, at a real, small monthly cost).
- **Firestore TTL**: `abuseCounters` documents are never explicitly
  deleted by this code — they accumulate. Configure a
  [Firestore TTL policy](https://cloud.google.com/firestore/docs/ttl) on
  the `expiresAt` field, so old rate-limit buckets get garbage-collected
  automatically instead of growing forever. Not done yet.
- **Observability** (Phase 3.8, also not yet done): structured logging,
  Cloud Monitoring alerts on 5xx rate/latency, and an uptime check on
  `/api/health`.
- **Firestore/Storage rules deploy**: `firestore.rules`/`firestore.indexes.json`
  were already deployed to the live database as of 2026-08-20 (predates
  this pass — verified via `gcloud firestore indexes composite list`, not
  assumed). `storage.rules` and the Hosting config itself (headers, the
  `/api/**` and `/website/**` rewrites) still need `firebase deploy`, which
  needs the `firebase` CLI re-authenticated — `gcloud` and `firebase` are
  separate credential stores, and only `gcloud` was re-authenticated in
  this pass.
