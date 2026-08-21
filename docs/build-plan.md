# Lumenical Web — Build Plan

Ordered work items to take lumenical.com from its current state (four static marketing
pages, two forms that send nothing) to a complete, dual-audience site backed by a real
Python API, Firestore, and an admin console.

Work top-to-bottom unless told otherwise. Each item has acceptance criteria; nothing is
"done" until `npm run build`, `npm run lint`, and `npx tsc --noEmit` all pass (the
`pre-deploy-check` skill runs the trio plus route spot-checks).

**Status of this document:** written 2026-08-21 from a full crawl of the repo. Decisions
recorded in §2 were made by the owner and should not be re-litigated in code.

---

## 1. Where the site is today

Verified by crawl, not assumption:

| | |
|---|---|
| Routes | `/`, `/services/`, `/about/`, `/contact/` + `not-found` |
| Stack | Next 16.3.1 App Router, `output: "export"`, `trailingSlash: true`, Tailwind 3.4.19, React 19.1 |
| Deploy | push to `main` → GitHub Actions → `out/` → Firebase Hosting, project `lumenical-ai`, via Workload Identity Federation |
| Forms | **Both send nothing.** `ContactForm` and `NewsletterForm` simulate success when their `NEXT_PUBLIC_*` env var is unset — which it is |
| Backend | None. `firestore.rules`, `firestore.indexes.json`, `storage.rules` describe ten collections that do not exist |
| Health | `tsc --noEmit` clean, `eslint` clean, build succeeds |
| Analytics | None. No Search Console verification, no CWV measurement |
| Legal | No privacy policy, no terms, no published contact address |

`firestore.rules` already defines `demos`, `pages`, `media`, `leads`,
`newsletterSubscribers`, `chatSessions`, `adminUsers`, `auditLog`, `outboundEmails`,
`abuseCounters` — with a comment referring to "the architecture plan." That plan did not
exist in the repo. This document is it.

### 1.1 The design system this repo drifted from

There is a formal **Lumenical Design System v0.1** at
`../ai-platform/design/lumenical/` (`design-guide.md` + light/dark DS HTML + logo lockup
sheet + `design/brand/` assets). The marketing site's palette and fonts came from it, but
three rules are being broken:

**Ink-400 is a non-text ink.** The DS is explicit: *"Ink-400 is a NON-TEXT ink. The DS's
own only use of it is the wordmark's 'ical' — a logo, and therefore WCAG-exempt. It must
never carry UI text again."* This site uses `text-ink-400` for real text on every page:
header nav links, all mono eyebrows, stat labels, footer column headings, footer
copyright, and the newsletter status line.

Measured against this site's own surfaces — Ink-400 `#6B7C94` fails the 4.5:1 AA floor on
every one, and the site applies it at 10–11px:

| text | on Paper-50 | on Paper-100 | on white |
|---|---|---|---|
| Ink-400 `#6B7C94` (current) | 3.98 ✗ | **3.71 ✗** | 4.25 ✗ |
| Ink-450 `#566780` (DS `--text-3`) | 5.39 ✓ | 5.03 ✓ | 5.76 ✓ |
| Ink-500 `#4A5C75` | 6.38 ✓ | 5.96 ✓ | 6.82 ✓ |

Paper-100 is the binding constraint — it's the background of the stats band, the services
teaser, and every page's eyebrow section. The DS's replacement rungs are `--text-3` =
**Ink-450 `#566780`** (light) and **Ink-350 `#8694A9`** (dark). Neither exists in
`tailwind.config.ts`.

Thirteen `text-ink-400` occurrences across `src/`. Twelve carry real text; one
(`globals.css:23`, the wordmark's `.ical`) is the WCAG-exempt logo and stays. One more
(`NewsletterForm.tsx:79`) is a `placeholder:` colour, which needs the same treatment.

The DS also requires tier-3 text to carry a size *or weight* step down, not colour alone —
`--text-2` to `--text-3` is only 1.18:1 apart.

**Dark mode is missing.** The DS ships both themes from day one and specifies the warm-dark
navy ramp (page `#07101D`, cards `#0E1A2B`, raised `#142436`, inputs `#1A2B40`, rules
`#25364F`). The site is light-only.

**The brand asset set is unused.** `design/lumenical/design/brand/` contains
`favicon.svg`, `favicon-16/32/48.png`, `apple-touch-icon.png`, `icon-512.png` plus gold /
light / maskable variants, and `l-mark.svg`. This repo ships one hand-drawn
`public/favicon.svg` (a ring and a dot) that isn't the DS mark, and no touch icon,
no PNG fallback, and no web manifest.

### 1.2 Defects found (all verified against source)

**Design-system and accessibility**

1. `text-ink-400` used for body/metadata text across `Header`, `Footer`, `page.tsx`,
   `about`, `services`, `contact`, `not-found`, `NewsletterForm` — fails AA (§1.1).
2. `NewsletterForm.tsx:58` — `className="font-serif not-italic italic"`. Contradictory
   utilities; `ContactForm.tsx:60` has the correct `font-serif italic`.
3. No skip-to-content link and `<main>` has no `id` (`layout.tsx:66`). Keyboard users tab
   the whole header on every page.
4. `globals.css:7` — `scroll-behavior: smooth` is unconditional; not gated on
   `prefers-reduced-motion`. (The wordmark pip animation *is* correctly gated.)
5. `ContactForm.tsx:117` — the error `<p>` has no `aria-live`, isn't linked by
   `aria-describedby`, and fields carry no `aria-invalid`. The success state replaces the
   form with no `role="status"` and no focus move, so screen readers are told nothing.
6. `Header.tsx` mobile menu — no Escape-to-close, no focus trap, no scroll lock, and it
   survives browser-back.
7. `not-found.tsx` exports no metadata (no title, no `robots: noindex`).
8. No `error.tsx` or `global-error.tsx` anywhere.

**SEO and metadata**

9. `layout.tsx:44` sets `twitter.card: "summary"` while `lib/seo.ts:35` sets
   `"summary_large_image"`. There is a 1200×630 OG image; the root should match.
10. No `export const viewport` → no `themeColor`, no `colorScheme`.
11. `pageMetadata()` never sets `openGraph.images`; every page leans on inheriting the
    root `opengraph-image.tsx`. Per-route OG output needs verifying, and per-page images
    would be better.
12. `sitemap.ts:8` hardcodes `["", "services", "about", "contact"]` — a manual list that
    must be kept in sync with `src/app/` by hand. Same drift risk in `navLinks`.
13. `opengraph-image.tsx` hardcodes `#0E1A2B` / `#6B7C94` / `#C9A658` / `#FAF7F2`.
    Satori can't read Tailwind so literals are unavoidable, but they should come from one
    shared token module, not be retyped.

**Content correctness**

14. `Footer.tsx:22` and `:53` use `<a href>` instead of `<Link>` → full page reloads on
    internal navigation.
15. `Footer.tsx:48` renders `© {site.founded}` = a permanently frozen "© 2026".
16. `site.ts:40` — `{ value: "6", label: "Disciplines, one team" }` is a hardcoded 6 that
    must track `services.length` by hand.
17. `public/CNAME` is dead — a GitHub Pages leftover the README itself admits does nothing.

**Infrastructure**

18. `firebase.json` has no `headers` block: no HSTS, no `X-Content-Type-Options`, no
    `Referrer-Policy`, no `Permissions-Policy`, no CSP — and no immutable long-cache for
    `/_next/static/**`, so hashed assets get Firebase's short default TTL.
19. `.github/workflows/deploy.yml` runs `npm run build` and deploys. It never runs
    `npm run lint` or `npx tsc --noEmit`. A type error can reach production.
20. No PR preview deploys (README confirms: "There's no preview-deploy step").
21. No Dependabot or Renovate config; no `engines` field and no `.nvmrc` (the workflow
    pins Node 20; a local Node mismatch is silent).
22. Both forms have zero spam protection — no honeypot, no captcha, no rate limit. Benign
    while they're no-ops; urgent the moment Phase 3 makes them real.
23. Tailwind 3.4.19 while Tailwind 4 is current. A deliberate upgrade decision to schedule,
    not drift to fix casually.
24. `.claude/` is gitignored, so this repo's own seven agents and seven skills are not
    version-controlled and don't reach a second machine or collaborator.

**Documentation drift**

25. `CLAUDE.md` says "Six pages." There are four.
26. The `legal-fact-sheet` skill says "static export deployed to GitHub Pages" — stale
    since the Firebase migration in `b77f611`.

---

## 2. Decisions (owner-approved 2026-08-21 — do not re-litigate)

| # | Decision |
|---|---|
| D-1 | **Scope: site + dynamic backend.** Build the full marketing site *and* the Firestore + Cloud Run Python API + admin console that `firestore.rules` anticipates. |
| D-2 | **Two audiences, two paths.** SMB consulting (5–100 people) and enterprise platforms are distinct tracks with their own nav entries and CTAs. The homepage IA is rewritten around this. |
| D-3 | **Publishable material is products, projects, scope, and demos only.** No testimonials, no client names, no logos, no pricing, no team bios — these are not written, invented, or scaffolded with placeholder people. Sections that would need them are omitted. |
| D-4 | **Legal: add `/privacy/`, `/terms/`, and publish `hello@lumenical.com`.** This reverses the standing "deliberately absent" note in `CLAUDE.md`, which must be updated in the same change so the two stop contradicting each other. |
| D-5 | **Form backend: Python API on Cloud Run + Firestore.** Not Apps Script, not a third party. |
| D-6 | **Admin console: full CMS + leads.** Firebase Auth with custom role claims, CRUD for `pages`/`demos`/`media`, leads pipeline, audit log, outbound email log. |
| D-7 | **On-site AI assistant: deferred.** Design the data model and API surface so it drops in cleanly (`chatSessions` stays in the rules), but do not build the widget in this plan. |

### 2.1 Architecture decisions that follow

| # | Decision | Why |
|---|---|---|
| A-1 | **The marketing site stays a static export.** `output: "export"` + `trailingSlash: true` remain load-bearing. | It's the constraint `CLAUDE.md` calls non-negotiable, it costs nothing to host, and nothing in D-1…D-7 actually requires SSR. |
| A-2 | **Firebase Hosting rewrites `/api/**` → Cloud Run.** | The API becomes **same-origin**. No CORS, no preflight, no `Content-Type: text/plain` workaround — the whole class of problem the `wire-form-backend` skill warns about disappears. |
| A-3 | **CMS content is baked at build time, not fetched in the browser.** Publishing in the admin console fires a `repository_dispatch` that rebuilds and redeploys. | `demos` and `insights` pages are SEO-critical. Client-side fetching would ship them as empty shells to crawlers. Build-time Firestore reads work fine under `output: "export"`. |
| A-4 | **The admin console is client-side routes inside the same Next export.** Flat routes (`/admin/leads/`, `/admin/pages/`, …) with client-side data fetching; detail views as drawers or `?id=` query params. | One deployable, one design system, no second build pipeline. Static export can't do un-parameterised dynamic segments, which is why routes stay flat. Authorization is enforced by the API and `firestore.rules` — the client-side check is UX only. |
| A-5 | **The Python API lives in this repo under `api/`.** Its own workflow, triggered on `api/**`. | `firestore.rules` and `firestore.indexes.json` already live here; splitting the schema from the only thing that writes to it invites drift. |
| A-6 | **Dark mode is implemented**, using the DS dark ramp. | The DS ships both themes from day one (§1.1) and the site is the brand's own storefront. |

### 2.2 Open decisions — needed before the phase that consumes them

| # | Question | Needed by | Recommendation |
|---|---|---|---|
| O-1 | **May the Qatar Central Bank engagement be named publicly?** `ai-platform`'s ADR-0035 deliberately made that product customer-neutral, and the owner's own address is `@qcb.gov.qa` — so this is a client-consent *and* disclosure question, not a copy choice. | Phase 1.4 | Default to an anonymised reference ("a national financial regulator, ~2,000 users, fully on-premises") and publish the name only with written sign-off. |
| O-2 | Analytics platform | Phase 2.7 | GA4 via `gtag` with Consent Mode v2, or Plausible if you'd rather avoid a consent banner entirely. The choice changes what `/privacy/` has to say. |
| O-3 | Transactional email provider | Phase 3.5 | Resend — simple API, good deliverability, generous free tier. |
| O-4 | Bot protection | Phase 3.4 | Cloudflare Turnstile — free, no cookie, privacy-policy-friendly. |
| O-5 | Meeting booking link on `/contact/` | Phase 2.4 | Cal.com (self-hostable, no visitor cookie) over Calendly. |
| O-6 | Insights authoring: MDX in-repo vs. the `pages` CMS collection | Phase 5.3 | The CMS — you're building it anyway in Phase 4, and it avoids a second content pipeline. |
| O-7 | Tailwind 4 upgrade timing | Phase 6.3 | After Phase 2 ships, before Phase 4's large admin UI is written. Upgrading once the admin console exists doubles the surface to re-verify. |
| O-8 | Commit `.claude/`? | Phase 0.8 | Yes. Un-versioned agent config is a single-machine liability. |

---

## 3. Target information architecture

**Public**

```
/                        Homepage — dual-audience, two explicit paths
/services/               SMB consulting index (existing, kept)
/services/[slug]/        6 detail pages — one per discipline (SEO)
/platforms/              Enterprise product line index
/platforms/[slug]/       AI Platform · Hub · Taskmaster
/demos/                  Demo index            (CMS: demos)
/demos/[slug]/           Individual demo       (CMS: demos)
/insights/               Writing index         (CMS: pages)
/insights/[slug]/        Article               (CMS: pages)
/process/                How engagements run
/about/                  Existing, extended
/faq/                    FAQ + FAQPage schema
/careers/                Hiring
/contact/                Existing + published email + booking
/privacy/                New (D-4)
/terms/                  New (D-4)
404
```

**Admin** — all `noindex`, all excluded from the sitemap

```
/admin/                  Login + dashboard
/admin/leads/            Leads pipeline
/admin/newsletter/       Subscriber list
/admin/pages/            Insights/pages CMS
/admin/demos/            Demos CMS
/admin/media/            Media library
/admin/audit/            Audit log viewer
/admin/emails/           Outbound email log
```

Fourteen public route patterns (24 generated pages) and eight admin routes, against four
public pages today.

---

## 4. Phase 0 — Foundations and truth-fixing

No new features. Fixes everything in §1.2 so later phases build on something sound. Roughly
3–5 days.

### 0.1 Design-system alignment
Add `ink.450` `#566780` and `ink.350` `#8694A9` to `tailwind.config.ts`. Add the DS dark
ramp as tokens. Replace every `text-ink-400` on real text with `text-ink-450`, and pair each
with the DS-required size or weight step down. Leave the wordmark's `.ical` on Ink-400 — it's
a logo and WCAG-exempt.

*Accept:* no `text-ink-400` remains in `src/` outside `globals.css`'s `.mark .ical`; every
text/background pair on the site measures ≥ 4.5:1 (≥ 3:1 for ≥ 24px); no raw hex added
outside `opengraph-image.tsx`.

### 0.2 Dark mode
Wire `darkMode: "class"`, add a semantic token layer (`--surface`, `--bg`, `--text-1/2/3`,
`--border`) mapped to both ramps, add a header theme toggle persisting to `localStorage`
with a `prefers-color-scheme` default and no flash-of-wrong-theme on first paint.

*Accept:* every page legible in both themes; contrast ≥ 4.5:1 in both; no component
hardcodes a surface colour; no FOUC.

### 0.3 Brand asset set
Copy the DS brand assets into `public/brand/`. Wire the full `icons` metadata (SVG, PNG
16/32/48, `apple-touch-icon`, maskable 512), add `manifest.webmanifest`, add
`export const viewport` with `themeColor` per scheme. Delete `public/CNAME`.

*Accept:* favicon renders at 16px and as an installed-PWA icon; Lighthouse raises no
manifest or touch-icon warning; the shipped mark is the DS mark.

### 0.4 Defect sweep
Items 2, 9, 14, 15, 16 of §1.2: fix the `not-italic italic` conflict, align the root
`twitter.card`, convert `Footer`'s `<a>` to `<Link>`, make the copyright year dynamic,
derive the "6 disciplines" stat from `services.length`.

*Accept:* internal footer navigation is client-side (no full reload); copyright reads
`© 2026–<current year>`; adding a seventh service would update the stat with no second edit.

### 0.5 Accessibility baseline
Items 3–8: skip link + `<main id="content">`, `prefers-reduced-motion` gate on smooth
scroll, full `ContactForm` a11y (`aria-live`, `aria-describedby`, `aria-invalid`,
`role="status"` + focus move on success), mobile menu Escape/focus-trap/scroll-lock,
`not-found` metadata with `robots: noindex`, and `error.tsx` + `global-error.tsx`.

*Accept:* every page keyboard-navigable start to finish; axe reports zero violations on all
four routes; a screen reader announces both form failure and form success.

### 0.6 Route registry
One `src/content/routes.ts` as the single source of truth — path, label, nav membership,
footer membership, sitemap inclusion, `noindex` flag. `navLinks`, `footerLinks`,
`sitemap.ts`, and the admin exclusions all derive from it.

*Accept:* adding a route means one edit; nothing in `/admin/` can reach the sitemap; the
`lumenical-qa` drift check verifies every `src/app/*/page.tsx` has a registry entry.

### 0.7 Hosting headers and cache policy
Add a `headers` block to `firebase.json`: HSTS with preload, `X-Content-Type-Options`,
`Referrer-Policy: strict-origin-when-cross-origin`, a locked-down `Permissions-Policy`, and
a report-only CSP to start. `Cache-Control: public, max-age=31536000, immutable` for
`/_next/static/**`; short revalidating TTL for HTML.

*Accept:* securityheaders.com grade A or better; hashed assets return the immutable header;
no CSP violation in the console on any route.

### 0.8 CI gate and repo hygiene
Add `npm run lint` and `npx tsc --noEmit` as blocking steps *before* build in `deploy.yml`.
Add a PR workflow running the trio plus a Firebase preview-channel deploy. Add Dependabot,
`.nvmrc`, and `engines`. Un-ignore and commit `.claude/` (O-8).

*Accept:* a deliberately introduced type error fails CI and does not deploy; PRs post a
preview URL; `node -v` matches CI locally.

### 0.9 Documentation reconciliation
`CLAUDE.md`: fix "Six pages", and rewrite the "No Privacy Policy, Terms of Service, or
published contact email — this is deliberate" paragraph, which D-4 has reversed. Fix the
`legal-fact-sheet` skill's stale GitHub Pages reference. Point `CLAUDE.md` at this document.

*Accept:* no statement in `CLAUDE.md`, `README.md`, or any skill contradicts the code or
§2's decisions.

---

## 5. Phase 1 — Dual-audience IA (D-2)

The largest copy-and-structure change in the plan. Roughly 5–8 days.

### 1.1 Content model split
`src/content/site.ts` currently encodes a single audience in `description`,
`differentiators`, and `stats`. Restructure into two audience objects, and add
`src/content/platforms.ts` alongside `services.ts`.

*Accept:* no page component reads audience copy from JSX; `services.ts` keeps its current
shape so `add-service` still works unchanged.

### 1.2 Homepage rewrite
Two clearly separated paths above the fold — "Consulting for growing businesses" (5–100)
and "Platforms for institutions" — each with its own value statement and CTA. The existing
hero, stats, and differentiators are rebuilt around the split, not bolted onto.

*Accept:* a first-time visitor from either audience can identify their path without
scrolling past the second viewport; voice still passes `write-copy` (restrained, sentence
case, no exclamation points, one serif-italic statement per section).

### 1.3 Navigation restructure
Header and footer carry both tracks. Header stays under seven top-level items; the footer
becomes a real multi-column sitemap covering both tracks plus legal.

*Accept:* every route in §3 reachable in ≤ 2 clicks from any page; mobile menu still passes
0.5's a11y bar.

### 1.4 `/platforms/` + `/platforms/[slug]/`
Index plus three product pages: **AI Platform** (bilingual EN/AR agentic platform — chat +
RAG, no-code agent builder, n8n workflows as governed agent tools, admin/governance console;
~2,000-user single-institution, fully on-premises), **Hub** (self-hosted integration
middleware — REST/SOAP hosting, integration flows, DMN rules, centralised variables and
secrets), **Taskmaster** (AI project and portfolio management; multi-tenant SaaS,
self-hosted, and air-gapped from one codebase).

Per D-3, describe capability and scope only. **Blocked on O-1** for any named-client
reference — write anonymised and revisit.

*Accept:* every claim traceable to the source repo's own docs; `generateStaticParams`
produces all three pages; no client name published without recorded sign-off.

### 1.5 `/services/[slug]/`
Six detail pages from the existing `services` array — expanded narrative, what an
engagement looks like, what you get. The `/services/` index links through instead of only
anchor-jumping.

*Accept:* six pages generated from `services.ts` with no per-page registration; existing
`#slug` anchors still resolve (redirect or keep); `add-service` produces a seventh detail
page with no code change.

### 1.6 Breadcrumbs and structured data
Breadcrumbs on all nested routes with `BreadcrumbList` JSON-LD. Add `Service` schema to
service pages and `SoftwareApplication` to platform pages, extending
`OrganizationSchema.tsx`'s existing rule: **only facts stated on the page** — no invented
ratings, prices, or counts.

*Accept:* Rich Results Test passes with zero errors on one page of each type; no property
asserts anything not visible on the page.

### 1.7 Per-page OG images
Convert `opengraph-image.tsx` into a shared generator consumed per route segment, so
services, platforms, demos, and insights each get a correct card. Extract the hex literals
into one token module (§1.2 item 13).

*Accept:* every route's OG image shows that page's title; social debuggers show no
inherited-wrong-title; token values exist in exactly one place.

---

## 6. Phase 2 — Trust, conversion, and legal

Roughly 4–6 days. `/privacy/` (2.3) must be drafted against Phase 3's *final* field list —
sequence it late, or revise it when Phase 3 lands.

### 2.1 `/process/`
How an engagement actually runs, per `about`'s existing "understand how your business runs
before we design anything" claim. Serves both audiences with a fork where they diverge.

### 2.2 `/faq/`
Real questions both audiences ask, plus `FAQPage` JSON-LD. Answers must not assert pricing
or timelines that don't exist (D-3).

*Accept:* FAQ content lives in `src/content/`; `FAQPage` schema validates; every answer
factually supported.

### 2.3 `/privacy/` and `/terms/`
Run the `legal-fact-sheet` skill **first** to generate the code-derived data-handling facts,
then write the pages from that. Must cover: the fields each form collects, Firestore
storage, the Cloud Run API, the email provider (O-3), Turnstile (O-4), analytics (O-2), and
Firebase Hosting logs. Footer-link both.

*Accept:* every claim in `/privacy/` matches what the code does; nothing describes a
processor that isn't wired; both pages in the sitemap and footer. **This is not legal
advice — the fact sheet is built for counsel to review, and counsel should.**

### 2.4 Contact overhaul
Publish `hello@lumenical.com` (D-4) on `/contact/` and in the footer, obfuscated against
naive harvesting. Add the booking embed (O-5) as an alternative to the form. Add
`ContactPoint` to the Organization schema now that a real address exists.

*Accept:* a visitor has three routes to reach you (form, email, booking); the form is no
longer a single point of failure; the mailto is live.

### 2.5 `/careers/`
Honest current-state page — how you hire, what you look for, where to write — with no
invented openings.

### 2.6 `/about/` extension
Extend for the dual audience. Per D-3, **no team bios or photos.**

### 2.7 Analytics, Search Console, and consent
Wire O-2. If GA4: Consent Mode v2 plus a consent banner, with analytics genuinely
suppressed until consent — a banner that loads trackers anyway is worse than none. Submit
the sitemap to Search Console and add site verification. Add a Core Web Vitals reporter.

*Accept:* no analytics request fires before consent (verify in the network panel);
`/privacy/` names exactly what's set; sitemap accepted by Search Console; LCP/INP/CLS
visible for real traffic.

---

## 7. Phase 3 — Python API on Cloud Run (D-5)

The critical path to "the forms actually work." Roughly 8–12 days.

### 3.1 API skeleton
`api/` in this repo (A-5): FastAPI + Pydantic v2 + `firebase-admin`, `uvicorn`,
multi-stage Dockerfile, `pytest`, `ruff`, `mypy`. Local dev against the Firestore emulator.

*Accept:* `GET /api/health` returns 200 locally in Docker; `pytest` and `ruff` pass; the
emulator path needs no live GCP project.

### 3.2 GCP infrastructure
Artifact Registry repo; Cloud Run service (min-instances 0, concurrency 80, memory 512Mi);
a dedicated runtime service account with only `datastore.user` and the Storage object roles
it needs; Secret Manager for the email and Turnstile keys; a WIF binding for the API's own
deploy workflow. Document every resource — nothing created by hand and forgotten.

*Accept:* deployment uses no long-lived key (matching the hosting workflow); the runtime SA
cannot read `adminUsers` beyond what it needs; all resources listed in `docs/infrastructure.md`.

### 3.3 Firestore data model
Formalise document shapes for the ten collections `firestore.rules` already gates —
field names, types, required/optional, timestamps, status enums. Verify
`firestore.indexes.json`'s four composite indexes match the queries actually written, and
add what's missing.

*Accept:* a written schema doc; every admin query has a supporting index; no query fails
with `FAILED_PRECONDITION` in staging.

### 3.4 Public endpoints
`POST /api/leads` (`name`, `email`, `companySize`, `message`) and
`POST /api/newsletter` (`email`). Each: Pydantic validation, a honeypot field, Turnstile
verification (O-4), and per-IP + per-email rate limiting through the `abuseCounters`
collection the rules already reserve. Newsletter subscribes idempotently. Never echo
whether an email is already known.

*Accept:* a valid submission writes exactly one document; a replayed submission doesn't
duplicate; rate limits return 429 with a real `Retry-After`; a missing Turnstile token is
rejected; `abuseCounters` stays server-only per the existing rules.

### 3.5 Outbound email
On a new lead: notify `hello@lumenical.com`; send the submitter a confirmation matching the
form's "within one business day" promise. Every send logged to `outboundEmails`. Provider
failure must not fail the request — the lead is already durably stored.

*Accept:* both emails arrive; SPF/DKIM/DMARC pass; a forced provider outage still returns
200 and still persists the lead; every attempt has an `outboundEmails` row.

### 3.6 Same-origin rewrite (A-2)
`firebase.json` rewrite `/api/**` → the Cloud Run service.

*Accept:* `https://lumenical.com/api/health` returns 200; no CORS header needed anywhere;
no preflight in the network panel.

### 3.7 Wire the forms
Point `ContactForm` and `NewsletterForm` at `/api/leads` and `/api/newsletter`. Both keep
`Content-Type: application/json` — same-origin makes the Apps Script `text/plain`
workaround unnecessary, so the deliberate mismatch `CLAUDE.md` documents goes away, and
that note must be updated with the change. **Remove the simulate-success fallback from
production builds** — keep it only behind an explicit dev flag. Optimistic success on a
form that silently discards data is the worst available failure mode.

*Accept:* a production submission is visible in Firestore within seconds; a real network
failure shows a real error, never a success; `.env.example`, `README.md`, `CLAUDE.md`, and
`wire-form-backend` all updated together.

### 3.8 Observability
Structured JSON logging with request IDs, `auditLog` writes for every mutation, Cloud
Monitoring alerts on 5xx rate and latency, and an uptime check on `/api/health`.

*Accept:* one lead is traceable end to end from log line to Firestore document to
`outboundEmails` row; a synthetic 500 fires an alert.

### 3.9 API CI/CD
`deploy-api.yml` on `api/**`: lint, type-check, test, build, push, deploy. Staging Cloud
Run service; a failing test blocks deploy.

*Accept:* an `api/` push deploys only the API; a site push doesn't touch it; a failing test
stops the pipeline.

---

## 8. Phase 4 — Admin console (D-6)

Roughly 10–15 days. The second-largest phase; effectively a second application.

### 4.1 Auth and roles
Firebase Auth (email/password + TOTP), custom claims `role: admin | editor` matching
`firestore.rules`' existing `hasRole` / `isEditorOrAdmin` helpers. A documented,
scriptable first-admin bootstrap. The API verifies the ID token and re-checks the claim on
every request — never trusting a client-asserted role.

*Accept:* an `editor` cannot reach admin-only endpoints; a forged claim is rejected
server-side; token expiry is handled without data loss mid-edit; every rules helper has a
passing emulator test.

### 4.2 Console shell (A-4)
`/admin/` login and dashboard, client-side route guard, `robots: noindex` on every admin
route, excluded from the sitemap via 0.6's registry. Reuses the DS tokens — no second
design language.

*Accept:* an unauthenticated visitor to any `/admin/` route sees the login screen and no
data; no admin route in `sitemap.xml`; `noindex` on all of them.

### 4.3 Leads and newsletter
Leads list with status pipeline, detail drawer, notes, status transitions writing to
`auditLog`. Subscriber list with export and unsubscribe handling.

*Accept:* server-side pagination on 1,000+ documents; every status change audited with
actor and timestamp; export contains only real stored fields.

### 4.4 Pages and demos CMS
CRUD for `pages` (insights) and `demos`, honouring the `status: draft | published` field
the rules already key public reads on. Rich text or MDX-ish editing, slug management,
per-item SEO fields, preview before publish.

*Accept:* a draft is invisible to unauthenticated reads (verified against the deployed
rules, not just the UI); publishing triggers 4.7; slug collisions are rejected.

### 4.5 Media library
Upload via API-issued signed URLs — never a client-side write, per `storage.rules`. Public
assets land under the `public/` prefix the rules already expose; everything else stays
admin-only.

*Accept:* a direct client-side upload attempt fails against the deployed rules; public
assets are readable anonymously, private ones are not; deleting a referenced asset warns
first.

### 4.6 Audit and email log viewers
Read-only, admin-only views over `auditLog` and `outboundEmails`, with filters.

### 4.7 Publish → rebuild (A-3)
Publishing calls an API endpoint that fires a GitHub `repository_dispatch`; a workflow
rebuilds the static site with fresh Firestore content and deploys. Surface build status in
the console so "published" doesn't silently mean "not live yet."

*Accept:* publish → live in under ~5 minutes with no manual step; a failed build is visible
in the console; concurrent publishes coalesce rather than queueing duplicate deploys.

### 4.8 Admin endpoints and authz tests
The full admin API surface with a test asserting the expected authorization outcome for
every endpoint × role combination — including anonymous.

*Accept:* the matrix is exhaustive and green; no admin endpoint is reachable anonymously.

---

## 9. Phase 5 — CMS-driven public pages

Roughly 4–6 days. Depends on Phase 4.

- **5.1** Build-time Firestore reads feeding `generateStaticParams` for published `demos`
  and `pages`, with a clear build failure (not a silent empty page) if Firestore is
  unreachable.
- **5.2** `/demos/` and `/demos/[slug]/` — the strongest available "we build AI" proof
  under D-3, since it's your own work rather than client stories.
- **5.3** `/insights/` and `/insights/[slug]/` (O-6) — article schema, reading time, tags,
  RSS feed.
- **5.4** End-to-end verification of the publish→rebuild loop from 4.7.

*Accept:* only `status: published` documents appear in `out/`; page source contains the
real content (not a client-fetched shell); an unreachable Firestore fails the build loudly;
RSS validates.

---

## 10. Phase 6 — Performance, hardening, launch

Roughly 3–5 days.

- **6.1** Performance budget: Lighthouse ≥ 95 on all four categories for every public
  route. Decide the image strategy — `images.unoptimized: true` is forced by static export,
  so responsive `srcset` and compression must be handled at build time or by hand.
- **6.2** Promote the CSP from report-only to enforcing. A static export can't use nonces,
  so this needs hashes or `strict-dynamic` — expect real iteration against the analytics
  and booking embeds.
- **6.3** `update-dependencies` pass, `npm audit` clean, and the Tailwind 4 upgrade (O-7).
- **6.4** Launch checklist: `security-review` on the full diff, `lumenical-review` on each
  phase's changes, all four public-route OG cards verified in real social debuggers, 404
  behaviour confirmed on Firebase, DNS/HSTS preload confirmed, `legal-fact-sheet`
  regenerated against final code, and a rollback procedure written down and *tested*.

*Accept:* budgets met on real hardware, not just locally; CSP enforcing with zero console
violations; a rollback has actually been performed once in staging.

---

## 11. Phase 7 — Deferred: on-site AI assistant (D-7)

Not built here. `chatSessions` stays in `firestore.rules` because the intent is real, and
Phase 3.3 should give it a documented shape so it isn't reverse-engineered later. Revisit
after Phase 6 ships. Note when it comes up: it is the only feature in this plan with a
recurring per-visitor cost, and it needs abuse limits before it is ever public.

---

## 12. Sequencing and critical path

Phases 0 → 1 → 2 are independent of the backend and can ship continuously; the site gets
better with every deploy. Phase 3 is the only phase that fixes a currently-broken promise
(forms that show success and discard the data), which argues for pulling it earlier than
its number suggests.

**Recommended order if launch date matters:**

1. **Phase 0** — the foundation everything else sits on, and it fixes a live WCAG failure.
2. **Phase 3.1–3.7** — make the forms real. The highest-severity defect on the site today.
3. **Phase 1** — the IA rewrite. The biggest change to what visitors understand.
4. **Phase 2** — legal and trust. `/privacy/` is only accurate once 3.x is settled.
5. **Phase 4 → 5** — the console and the content it drives.
6. **Phase 6** — harden and launch.

Total: roughly **37–57 working days** of focused build. Phases 4 and 5 are over half of it —
if a launch date is tight, Phases 0 → 3 → 1 → 2 → 6 is a complete, honest, feature-rich
static site with working forms, and Phases 4 and 5 can follow.

**Running cost:** Cloud Run at min-instances 0, Firestore, and Storage all sit inside the
free tier at marketing-site traffic. Two things to know: a cold start adds roughly 1–2s to
the first form submission after idle (fixable with min-instances 1, at a real monthly cost),
and the email provider (O-3) is the one line item likely to leave the free tier first.

---

## 13. Cross-cutting rules for every phase

- **No invented facts.** D-3 is binding. `OrganizationSchema.tsx`'s existing comment —
  *"no invented phone number, email, hours, or ratings; fabricated structured data risks a
  manual Google Search Console action"* — is the standard for all content and schema, not
  just that file.
- **No raw hex in components.** Tokens live in `tailwind.config.ts`.
  `opengraph-image.tsx` is the sole exception (Satori can't read Tailwind) and must import
  from one shared token module after 1.7.
- **Ink-400 never carries text.** §1.1. This is the rule the current site breaks most.
- **`output: "export"` survives everything** (A-1). Any change that needs a server runtime
  is a decision to escalate, not a config edit to make quietly.
- **Voice:** restrained, sentence case, no exclamation points, serif italic reserved for one
  statement per section. Use `write-copy` / `lumenical-content` for all copy.
- **Verify before reporting done:** `pre-deploy-check`, then `lumenical-review` on any
  non-trivial diff.
- **Docs move with code.** `CLAUDE.md`, `README.md`, `.env.example`, and the affected skill
  get updated in the *same* change — §1.2's items 25–26 are what happens otherwise.
