# Lumenical website

Marketing site for Lumenical, built with Next.js (App Router, static export) and Tailwind CSS. Deploys as plain static HTML to Firebase Hosting at [lumenical.com](https://lumenical.com) (project `lumenical-ai`).

## Structure

```
src/
  app/            Route segments (App Router) — one folder per page
  components/     Shared UI (Header, Footer, forms, etc.)
  content/        Editable site copy and data (site.ts, services.ts)
public/           Static assets, favicon, CNAME
```

To edit page copy, start in `src/content/` before touching component files — most text lives there, not inline in JSX.

**Content status:** copy across the site (services, about) is a first-pass draft written to match the existing brand voice. It has not been reviewed against real service offerings or pricing — review before treating any of it as final.

**No Privacy Policy or Terms of Service page currently exists** — both were deliberately removed. The site still collects visitor data via the newsletter and contact forms; worth revisiting whether a privacy policy is needed before this goes live in a jurisdiction that requires one.

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

## Forms

Both forms degrade gracefully with no backend configured:

- **Newsletter** (`src/components/NewsletterForm.tsx`) simulates success locally unless `NEXT_PUBLIC_NEWSLETTER_SCRIPT_URL` is set. The original coming-soon page posted to a Google Apps Script web app that appended rows to a Google Sheet — point this env var at that same (or a new) Apps Script deployment URL to keep using that pattern.
- **Contact** (`src/components/ContactForm.tsx`) simulates success locally unless `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` is set to an endpoint that accepts a JSON POST (`{ name, email, companySize, message }`) — an Apps Script deployment, or a service like Formspree. There's no fallback contact email published anywhere on the site, so this is currently the only way for a visitor to reach out.

Copy `.env.example` to `.env.local` for local testing. In production, these are set as [GitHub Actions repository variables](../../settings/variables/actions) named `NEWSLETTER_SCRIPT_URL` and `CONTACT_FORM_ENDPOINT` — see `.github/workflows/deploy.yml`.

A backend replacing this Apps Script pattern entirely — real `leads`/`newsletterSubscribers` Firestore collections behind a Python API on Cloud Run — is planned; see `firestore.rules`, `firestore.indexes.json`, and `storage.rules` at the repo root for the schema already provisioned ahead of that build-out.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys `out/` to **Firebase Hosting** (project `lumenical-ai`) using [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) — no downloaded service-account key involved. The workflow authenticates as the `github-deployer` service account, scoped to that GitHub repo only via the `github-actions` WIF pool/provider in the `lumenical-ai` GCP project.

If you want the form backends wired up in the meantime, add the `NEWSLETTER_SCRIPT_URL` / `CONTACT_FORM_ENDPOINT` repository variables under **Settings → Secrets and variables → Actions → Variables**.

`public/CNAME` is a leftover from when this repo deployed to GitHub Pages — Firebase Hosting's custom domain is configured separately (via `firebase hosting:sites` / the Firebase console), not via that file. It's harmless to leave, but no longer does anything.

## Adding a page

Create a new folder under `src/app/`, e.g. `src/app/careers/page.tsx`, exporting a default component and a `metadata` object. Add it to `navLinks` or `footerLinks` in `src/content/site.ts` if it should appear in navigation, and to the route list in `src/app/sitemap.ts`.
