# Lumenical Admin

The admin console (leads/newsletter pipeline, pages/demos CMS, media
library, audit log, outbound email log — `docs/build-plan.md` Phase 4) as
its own deployable app, independent of the marketing site. See
`docs/build-plan.md`'s superseded-A-4 note for why this is split out, and
`docs/infrastructure-admin.md` for the live infrastructure (Cloud Run,
region `me-central1`, deployed 2026-08-22).

Unlike the marketing site, this is a real server-rendered Next.js app (no
`output: "export"`) — that's what lets `src/proxy.ts` verify a session
cookie server-side before any admin page renders, instead of relying on a
client-side-only check.

Served at **`lumenical.com/website/**`** via a `firebase.json` Hosting
rewrite — not its own subdomain. This repo's GCP org already runs a
separate, unrelated product with its own `/api/*`-style routing, so this
app lives under a path prefix instead (`basePath: "/website"` in
`next.config.mjs`).

## Architecture

- **Auth**: Firebase Auth (client SDK) signs the user in and gets a
  short-lived ID token, exactly as before. `src/lib/auth.tsx`
  (`AdminAuthProvider`) additionally POSTs that token to `/api/session`,
  which mints an `httpOnly` session cookie via `firebase-admin`. `src/proxy.ts`
  checks that cookie on every page navigation and redirects to `/` if it's
  missing or invalid — real, server-side gating. The session cookie never
  authorizes data access by itself; every admin data request still carries
  its own fresh bearer ID token, which the Python API independently
  verifies (`require_admin_user` / `require_admin_only` in `api/app/auth.py`).
- **Talking to the Python API**: `src/app/api/[...path]/route.ts` is a
  backend-for-frontend proxy, publicly served at `/website/api/**` (via
  `basePath`) — the browser calls same-origin `/api/**` (via
  `src/lib/api.ts`'s `adminFetch`, which itself prefixes with `BASE_PATH`
  from `src/lib/base-path.ts` — plain `fetch()` calls aren't basePath-aware
  automatically, unlike `next/link`), and this server-side route forwards
  to the real API (`ADMIN_API_BASE_URL`). Two different bearer tokens
  travel on the same outbound request: a Cloud Run identity token in the
  **standard `Authorization` header** (confirmed against live
  infrastructure — Cloud Run's IAM invoker check reads that header
  specifically, not an alternate one), and the browser's Firebase ID token
  in a custom `X-Firebase-Id-Token` header instead (which `api/app/auth.py`
  reads). This keeps the Python API's Cloud Run service
  `--no-allow-unauthenticated` without ever needing CORS.
- **Design tokens**: `tailwind.config.ts` and `src/app/globals.css` are
  deliberately duplicated from the marketing app, not shared — see
  `CLAUDE.md`. Keep them in sync by hand if the design system changes.

## Local development

Requires Node.js 20+, and a locally-running `api/` (see `api/README.md`) if
you want data to actually load rather than error.

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true, FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099,
# and ADMIN_API_BASE_URL=http://127.0.0.1:8000 to run fully against local emulators.

# From the repo root, alongside api/'s own emulator instructions:
firebase emulators:start --only auth,firestore --project lumenical-ai-dev

npm run dev -- --port 3001   # 3000 is the marketing site's dev server
```

Visit `http://localhost:3001/website` — not the bare port, `basePath`
applies in dev too. Signing in against the Auth emulator needs a user with
a `role` custom claim already set — see `docs/build-plan.md` 4.1 for the
first-admin bootstrap script.

## Build

```bash
npm run build
```

Produces a `.next/standalone` server (via `output: "standalone"` in
`next.config.mjs`) — a real Node process, unlike the marketing site's static
`out/`. `Dockerfile` packages that output for Cloud Run. The
`NEXT_PUBLIC_FIREBASE_*` vars are inlined at *build* time, not read from the
deployed container's environment — pass them as `--build-arg` to
`docker build`, matching `Dockerfile`'s `ARG`/`ENV` lines.

## Deployment

Live on Cloud Run as of 2026-08-22 — see `docs/infrastructure-admin.md` for
the exact resources and `.github/workflows/deploy-admin.yml` for the CI/CD
pipeline (WIF-authenticated, no long-lived key). The `lumenical.com/website/**`
Hosting rewrite itself still needs a `firebase deploy --only hosting` to go
live — pending re-authenticating the `firebase` CLI (separate credential
store from `gcloud`).
