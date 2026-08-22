# Lumenical website

Marketing site for Lumenical, built with Next.js (App Router, static export) and Tailwind CSS. Deploys as plain static HTML to Firebase Hosting at [lumenical.com](https://lumenical.com) (project `lumenical-ai`).

## Structure

```
src/
  app/            Route segments (App Router) — one folder per page
  components/     Shared UI (Header, Footer, forms, etc.)
  content/        Editable site copy and data (site.ts, services.ts, platforms.ts, faq.ts, routes.ts)
public/           Static assets, favicon, brand/
api/              Python (FastAPI) backend for the two forms — see api/README.md
admin/            Admin console, deployed separately — see admin/README.md
```

To edit page copy, start in `src/content/` before touching component files — most text lives there, not inline in JSX.

**Content status:** copy across the site (services, about) is a first-pass draft written to match the existing brand voice. It has not been reviewed against real service offerings or pricing — review before treating any of it as final.

**`/privacy/` and `/terms/` exist, and `hello@lumenical.com` is published.** Both legal pages were drafted from a `legal-fact-sheet` run against the finalized Phase 3 data model — see `LEGAL-FACT-SHEET.md` (gitignored, regenerate if the API's fields or integrations change). Neither page has been reviewed by a lawyer; `/terms/` in particular has no governing-law clause since no fact in this repo establishes a jurisdiction.

This repo also holds two other independently deployed apps: the Python API (`api/`, see below) and the admin console (`admin/`, leads/newsletter/CMS/media/audit/email — see `admin/README.md`). See `docs/build-plan.md` for the full scope and phase order, and `docs/infrastructure.md` / `docs/infrastructure-admin.md` for what's needed to actually deploy each (both built and tested, neither yet live).

## Local development

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Build

```bash
npm run build
```

Produces a fully static site in `out/` (via `output: "export"` in `next.config.mjs`) — no Node server required to host it.

## Forms and the API

Both forms `POST` same-origin JSON to the real API: `NewsletterForm.tsx` → `/api/newsletter`, `ContactForm.tsx` → `/api/leads`. `firebase.json`'s `hosting.rewrites` sends `/api/**` to the Cloud Run service described in `api/` — same-origin, so no CORS and no configurable endpoint. Both forms carry a hidden honeypot field and a Cloudflare Turnstile widget (`src/components/Turnstile.tsx`) that renders nothing until `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set.

`NEXT_PUBLIC_SIMULATE_FORMS=true` is a **local-dev-only** escape hatch (see `.env.example`) that makes both forms fake success without calling the API — useful if you're not running `api/` locally too. Never set it in production; `deploy.yml` doesn't, and `preview.yml` deliberately does (so testing a PR never writes real leads into Firestore).

`hello@lumenical.com` (rendered via `src/components/ObfuscatedEmail.tsx` — hidden from the static HTML until a real click) is published on `/contact/`, `/careers/`, and the footer as an alternative contact channel.

**The API itself** (`api/`, FastAPI + Firestore, Cloudflare Turnstile verification, best-effort Resend email) is fully built and tested against the local Firestore emulator — see `api/README.md`. **It's deployed to Cloud Run** (`docs/infrastructure.md`) as of 2026-08-22, but Turnstile/Resend aren't configured yet (no accounts exist), and `firebase.json`'s `/api/**` rewrite still needs a Hosting deploy to actually take effect in production — until then, form submissions in production either simulate (if `NEXT_PUBLIC_SIMULATE_FORMS` is set) or fail against a route that doesn't resolve yet.

## CMS-driven pages

`/demos/` and `/insights/` (with an `/insights/rss.xml` feed) read published content directly from Firestore at build time via `src/lib/cms.ts`, using the public client SDK against `firestore.rules`' existing unauthenticated read grant for published docs — no admin credential needed. Gated behind `NEXT_PUBLIC_CMS_LIVE` (unset by default, since no live Firestore project exists yet): unset means both routes render an empty "coming soon" state with zero Firestore calls and are excluded from nav/sitemap; once set `true`, an unreachable Firestore fails the build loudly instead. See `docs/build-plan.md` Phase 5.

To test locally against the Firestore emulator, build with `next build --webpack` rather than the default Turbopack build — `connectFirestoreEmulator`'s redirect doesn't reliably take effect under Turbopack's static-generation workers (see the comment at the top of `src/lib/cms.ts`); this only affects local emulator testing, not production.

## Analytics

Cookieless via [Plausible](https://plausible.io) — no consent banner needed. A no-op unless `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set (see `.env.example`); wired in `src/app/layout.tsx`. Core Web Vitals are forwarded to Plausible as a custom event by `src/components/WebVitalsReporter.tsx`, itself a no-op if Plausible never loaded.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys `out/` to **Firebase Hosting** (project `lumenical-ai`) using [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) — no downloaded service-account key involved. The workflow authenticates as the `github-deployer` service account, scoped to that GitHub repo only via the `github-actions` WIF pool/provider in the `lumenical-ai` GCP project.

If you want Plausible or Turnstile wired up, add the `PLAUSIBLE_DOMAIN` / `TURNSTILE_SITE_KEY` repository variables under **Settings → Secrets and variables → Actions → Variables**. Both are deliberately only set in `deploy.yml`, not `preview.yml` — preview-channel traffic shouldn't pollute production analytics or require a real Turnstile challenge to test a PR.

Pull requests trigger `.github/workflows/preview.yml`, which runs the same lint/type-check/build and deploys to a temporary Firebase Hosting preview channel, commenting the preview URL on the PR.

A separate `.github/workflows/deploy-api.yml`, triggered only on `api/**` changes, lints/type-checks/tests the Python API (against a real Firestore emulator it starts itself — no GCP access needed for this part) and then builds/pushes/deploys its container to Cloud Run. That deploy step needs the WIF binding documented in `docs/infrastructure.md`, which doesn't exist yet — the test job works today regardless.

Similarly, `.github/workflows/deploy-admin.yml`, triggered only on `admin/**` changes, lints/type-checks/builds the admin console and deploys it to its own Cloud Run service, served at `lumenical.com/website/**` via a `firebase.json` Hosting rewrite (not its own subdomain). See `docs/infrastructure-admin.md`.

## Adding a page

Create a new folder under `src/app/`, e.g. `src/app/careers/page.tsx`, exporting a default component and a `metadata` object (via `pageMetadata()` from `src/lib/seo.ts`). Add one entry to `src/content/routes.ts` — `navLinks`, `footerLinks`, and `src/app/sitemap.ts` all derive from it, so that's the only registration needed.
