# Lumenical Admin

The admin console (leads/newsletter pipeline, pages/demos CMS, media
library, audit log, outbound email log — `docs/build-plan.md` Phase 4) as
its own deployable app, independent of the marketing site. See
`docs/build-plan.md`'s superseded-A-4 note for why this is split out, and
`docs/infrastructure-admin.md` for what's needed to actually deploy it (not
done yet — this is code + docs, not live infrastructure).

Unlike the marketing site, this is a real server-rendered Next.js app (no
`output: "export"`) — that's what lets `src/proxy.ts` verify a session
cookie server-side before any admin page renders, instead of relying on a
client-side-only check.

## Architecture

- **Auth**: Firebase Auth (client SDK) signs the user in and gets a
  short-lived ID token, exactly as before. `src/lib/auth.tsx`
  (`AdminAuthProvider`) additionally POSTs that token to `/api/session`,
  which mints an `httpOnly` session cookie via `firebase-admin`. `src/proxy.ts`
  checks that cookie on every page navigation and redirects to `/` if it's
  missing or invalid — real, server-side gating. The session cookie never
  authorizes data access by itself; every admin data request still carries
  its own fresh bearer ID token, which the Python API independently
  verifies (`require_admin_user` / `require_admin_only` in `api/app/auth.py`,
  unchanged by this split).
- **Talking to the Python API**: `src/app/api/admin/[...path]/route.ts` is a
  backend-for-frontend proxy — the browser only ever calls same-origin
  `/api/admin/**` (via `src/lib/api.ts`'s `adminFetch`, unchanged), and this
  server-side route forwards to the real API (`ADMIN_API_BASE_URL`),
  attaching a Cloud Run identity token via `X-Serverless-Authorization` when
  running on Cloud Run. This keeps the Python API's Cloud Run service
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

Visit `http://localhost:3001`. Signing in against the Auth emulator needs a
user with a `role` custom claim already set — see `docs/build-plan.md` 4.1
for the first-admin bootstrap script.

## Build

```bash
npm run build
```

Produces a `.next/standalone` server (via `output: "standalone"` in
`next.config.mjs`) — a real Node process, unlike the marketing site's static
`out/`. `Dockerfile` packages that output for Cloud Run.

## Deployment

Not done yet. See `docs/infrastructure-admin.md` for the exact `gcloud`
commands this needs, and `.github/workflows/deploy-admin.yml` for the CI/CD
pipeline that will run them once provisioned.
