---
name: wire-form-backend
description: SUPERSEDED as of Phase 3 — both forms now POST to the real API (api/), not a configurable third-party endpoint. Kept only as historical context for the pre-Phase-3 Apps Script pattern this repo used before the Python API existed. If someone asks to "wire up the contact form" today, the real task is almost always deploying api/ (see docs/infrastructure.md) or setting a repo variable (TURNSTILE_SITE_KEY, RESEND_API_KEY) — not touching the frontend fetch calls at all.
when_to_use: "wire up the contact form" (only if the API isn't deployed yet — check docs/infrastructure.md's status note first)
---

**This skill describes a pattern that no longer exists in the code.** Before Phase 3, `NewsletterForm.tsx`/`ContactForm.tsx` posted to a configurable external URL (`NEXT_PUBLIC_NEWSLETTER_SCRIPT_URL`/`NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`, typically a Google Apps Script deployment) with mismatched `Content-Type`s to dodge a CORS preflight issue. That's gone: both forms now `POST` same-origin to `/api/newsletter` and `/api/leads`, which `firebase.json`'s `hosting.rewrites` sends to the Cloud Run API in `api/` — same-origin means no CORS, no preflight, no content-type workaround needed at all (A-2 in `docs/build-plan.md`).

## What "wire up the form" actually means now

The frontend side is already done — nothing to touch in `NewsletterForm.tsx`/`ContactForm.tsx`/`Turnstile.tsx` for this. What's actually missing is one or more of:

1. **The API isn't deployed.** See `docs/infrastructure.md` for the exact `gcloud` commands (Artifact Registry, a runtime service account, Secret Manager, the Cloud Run service, a WIF binding for `.github/workflows/deploy-api.yml`) and `api/README.md` for local dev/testing against the Firestore emulator in the meantime.
2. **Turnstile isn't configured** — set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (frontend, repo variable in `deploy.yml`) and `TURNSTILE_SECRET_KEY` (API, Secret Manager) once a Cloudflare account/widget exists. Until then the widget doesn't render and the API skips verification — not broken, just inactive.
3. **Resend isn't configured** — set `RESEND_API_KEY` (API, Secret Manager) once a Resend account exists. Until then every send attempt is logged to `outboundEmails` with `status: "skipped"` — the lead is still durably stored either way.

None of these are frontend code changes. If a request is actually about changing what data the forms collect or how they validate, that's `api/app/models.py` (Pydantic request shapes) plus the matching frontend payload in the two form components — not this historical pattern.

## Before finishing

If you deploy the API or configure Turnstile/Resend, update `LEGAL-FACT-SHEET.md` (re-run the `legal-fact-sheet` skill) and `/privacy/`'s wording — it currently says Turnstile/Resend are "not currently active," which stops being true the moment either key is set.
