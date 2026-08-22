# Lumenical API

FastAPI backend for the two public marketing-site forms — `POST /api/leads`
and `POST /api/newsletter` — backed by Firestore. See
`docs/build-plan.md` Phase 3 for the full plan and
`docs/infrastructure.md` for what's needed to actually deploy this (not
done yet — this repo currently only has the code, tested against the local
emulator).

## Local development

Requires [uv](https://docs.astral.sh/uv/), the
[Firebase CLI](https://firebase.google.com/docs/cli), and a JVM (the
Firestore emulator itself needs one).

```bash
uv sync
cp .env.example .env   # everything in it is optional; unset = integration skipped

# From the repo root (firebase.json lives there):
firebase emulators:start --only firestore --project lumenical-ai-dev

# In another terminal, from api/:
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GOOGLE_CLOUD_PROJECT=lumenical-ai-dev \
  uv run uvicorn app.main:app --reload --port 8000
```

`curl http://127.0.0.1:8000/api/health` should return `{"status": "ok"}`.
The Firestore emulator UI is at `http://127.0.0.1:4000` (enabled in
`firebase.json`) if you want to inspect what gets written.

**No live GCP project is needed for any of this** — `firebase-admin`
resolves an anonymous credential automatically whenever
`FIRESTORE_EMULATOR_HOST` is set (see `app/firestore_client.py` for why
that needs an explicit workaround rather than just working out of the box).

## Testing

```bash
uv run pytest        # starts and tears down its own Firestore emulator
uv run ruff check .
uv run mypy app
```

The `client` fixture in `tests/conftest.py` starts a real
`firebase emulators:start --only firestore` subprocess for the whole test
session — not a mock. On Windows specifically, tearing it down uses
`taskkill /T` rather than `Popen.terminate()`, because `shell=True` spawns
a `cmd.exe` wrapper around the actual emulator process tree; killing just
the wrapper orphans the Java/Node emulator process, which then keeps
holding port 8080 across every subsequent test run.

## Integrations (all optional, all gated by an env var)

| Integration | Env var | Effect when unset |
|---|---|---|
| Cloudflare Turnstile (bot check) | `TURNSTILE_SECRET_KEY` | Verification is skipped — every submission passes |
| Resend (outbound email) | `RESEND_API_KEY` | Email send is skipped; still logged to `outboundEmails` with `status: "skipped"` |

Neither integration's absence blocks a submission — the lead or
subscription is always durably written to Firestore first. A Resend
failure is caught and logged, never raised back to the caller (see
`app/email.py`).

## Rate limiting

Fixed-window counters in the `abuseCounters` Firestore collection (already
reserved for exactly this in `firestore.rules` — `allow read, write: if
false`, so only this API, using the Admin SDK, ever touches it). Leads are
limited per-IP and per-email; newsletter signups per-IP only. See
`app/rate_limit.py` — exactly `limit` requests are allowed per window, not
`limit - 1` (a real off-by-one bug here was caught and fixed during initial
testing, see git history if you're touching this file).

## Deployment

Not done yet. See `docs/infrastructure.md` for the exact `gcloud` commands
this needs (Artifact Registry, a dedicated runtime service account, Secret
Manager, the Cloud Run service itself, and a WIF binding for
`.github/workflows/deploy-api.yml`), and `firebase.json`'s
`hosting.rewrites` for the same-origin `/api/**` → Cloud Run mapping
already wired on the hosting side.
