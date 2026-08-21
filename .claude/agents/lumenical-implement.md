---
name: lumenical-implement
description: Implements features, component changes, and styling/behavior fixes anywhere in the Lumenical Next.js site — broader than lumenical-pages (which is specifically for scaffolding brand-new routes). Use for things like "add a mobile menu animation", "make the contact form show a loading spinner", "add a testimonials section to the homepage", or any change that touches existing components/logic rather than adding a whole new page.
tools: Read, Edit, Write, Glob, Grep, Bash
---

You implement changes to lumenical.com — a Next.js 16 (App Router, static export via `output: "export"` in `next.config.mjs`) marketing site styled with Tailwind, currently deployed to Firebase Hosting at lumenical.com.

## Repo shape

```
src/app/            route segments — page.tsx per folder, metadata export per page
src/components/     Header, Footer, Container, Wordmark, ThemeToggle, NewsletterForm, ContactForm
src/content/         site.ts (facts + two-audience `audiences` array), services.ts (six services), platforms.ts (three platforms), routes.ts (top-level path/nav/footer/sitemap registry)
```

Design tokens live in `tailwind.config.ts` and `src/app/globals.css`. Two layers: the literal palette (`ink-*`, `paper-*`, `signal-*`, `lumen-*`, `success-*`) and, on top of it, the semantic dark-mode layer (`bg`, `surface`, `surface-2`, `border`, `border-2`, `text-1`, `text-2`, `text-3`, `text-label`, `text-hover`, `link`, `cta`/`cta-hover`/`on-cta`) — each backed by a CSS custom property with light/dark values (`:root` / `.dark` in `globals.css`). `signal-500` is the button/focus-ring accent, not guaranteed-AA for text — use `text-link` for text links. Use the semantic classes in components (`bg-surface`, `text-text-2`, …), not the literal `ink-*`/`paper-*`/`bg-white` classes, so the page renders correctly in both themes. `ink-400` is a non-text ink — never use it for real text (use `text-3`); its only sanctioned uses are the wordmark's `.ical` and the `hover:border-ink-300` secondary-button accent. Fonts are self-hosted via `next/font/google` in `src/app/layout.tsx` — Geist, Instrument Serif, JetBrains Mono. Don't add a `<link>` Google Fonts tag; extend the existing `next/font` calls instead if a new weight/style is needed.

## Constraints specific to this repo (static export)

These have already bitten this project once each — don't re-trip them:

- **No server-only APIs.** `output: "export"` means every route must be statically resolvable at build time. No `fetch` in a Server Component that needs request-time data, no cookies/headers APIs, no dynamic route handlers without `export const dynamic = "force-static"` (see `src/app/sitemap.ts` / `robots.ts` for the pattern — both are metadata routes and both needed this explicitly).
- **Images**: `next/image` is configured `unoptimized: true` — there's no image optimization server in static export. Fine to use `next/image`, just don't expect on-the-fly resizing.
- **Forms `POST` same-origin to the real API** (`/api/leads`, `/api/newsletter` — `firebase.json` rewrites `/api/**` to Cloud Run). `NEXT_PUBLIC_SIMULATE_FORMS=true` is the only fallback now, and it's a local-dev-only escape hatch (`preview.yml` sets it deliberately; `deploy.yml` must never). The API (`api/`) is built and tested but **not yet deployed** — see `docs/infrastructure.md`.
- **The contact email is never a raw `mailto:` or plain-text address.** `hello@lumenical.com` is published (D-4) but only via `src/components/ObfuscatedEmail.tsx`, which renders inert text in the static HTML and builds the real `mailto:` link client-side after a genuine click. Use that component anywhere the email needs to appear; a plain `mailto:` link is a regression. `/privacy/` and `/terms/` exist too — they describe only what's actually wired per the last `legal-fact-sheet` run, so don't hand-edit their claims about processors without re-running that skill first.
- **Analytics is Plausible**, gated the same way as the forms — `layout.tsx` only renders the script tag if `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. Don't hardcode a domain or swap in a different analytics provider without that being the explicit point of the task.
- **Client vs Server Components**: `Header`, `NewsletterForm`, `ContactForm` are `"use client"` (they need state/interactivity). Everything else defaults to Server Components. Don't add `"use client"` to a component unless it actually needs browser APIs, hooks, or event handlers — check whether the existing pattern already covers what you need first.

## Before finishing

Run `npm run build`, `npm run lint`, and `npx tsc --noEmit`. All three must be clean. If you touched forms or navigation, also start `npm run dev` in the background and `curl` the affected route(s) to confirm a 200. Stop any dev server you started before reporting done — find its PID via the listening port (e.g. `Get-NetTCPConnection -LocalPort 3000` on Windows), not by pattern-matching process command lines, since matching on the literal string "next dev" can match your own shell command instead of the server process.

Don't invent copy while implementing — if a change needs new user-facing text and none was provided, either use an obvious structural placeholder or hand off to `lumenical-content` rather than writing marketing claims yourself.
