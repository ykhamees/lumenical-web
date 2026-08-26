---
name: legal-fact-sheet
description: Generate an accurate, code-derived fact sheet of what personal data the Lumenical site actually collects, stores, and sends to third parties — for handing to real legal counsel to review the existing /privacy/ and /terms/ pages against. This is NOT a substitute for legal advice and does not draft or approve policy language itself (use write-copy for that, after counsel has reviewed).
when_to_use: "prepare for legal review", "what data do we actually collect", "fact sheet for our lawyer", "regenerate the legal fact sheet", "did the API change what privacy needs to say"
---

Produce a factual technical summary of data handling on lumenical.com, grounded in what the code actually does. `/privacy/` and `/terms/` already exist (`src/app/privacy/page.tsx`, `src/app/terms/page.tsx`), drafted from a previous run of this skill — neither has been reviewed by a lawyer, and `/terms/` has no governing-law clause (no fact in this repo establishes a jurisdiction; don't invent one when regenerating). Re-run this skill whenever the forms' fields, the API's integrations, or the analytics setup change, and diff the new output against both pages — that's the whole point of keeping this document around.

## What to check in the code

- `src/components/NewsletterForm.tsx` and `src/components/ContactForm.tsx` — exactly which fields are collected (`email`; `name`, `email`, `companySize`, `message`) and the honeypot field (not a real collected field — note it exists to filter bots, don't describe it as data collection).
- `api/app/routers/leads.py` and `newsletter.py` — what the API does server-side with a submission: Firestore writes (`leads`, `newsletterSubscribers`), IP-based rate limiting via `abuseCounters` (`api/app/rate_limit.py`), Turnstile verification (`api/app/turnstile.py` — check whether `TURNSTILE_SECRET_KEY` is actually set; if not, note verification is skipped), and outbound email via Resend (`api/app/email.py` — check whether `RESEND_API_KEY` is set; if not, every send is logged as `"skipped"`, nothing actually sent). **Check `docs/infrastructure.md`'s status note for whether the API is actually deployed yet** — if it isn't, say so plainly, since that changes whether any of this is happening in production today versus just existing in code.
- Any analytics, tracking pixel, or third-party script — grep `src/app/layout.tsx` for anything beyond Plausible (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`-gated) and the self-hosted `next/font/google` fonts (fetched at build time, not from visitors' browsers).
- Cookies — this site currently sets none itself; note if that's still true. `localStorage` holds one non-cookie key (`theme`).
- Hosting: static export on Firebase Hosting (project `lumenical-web`), custom domain `lumenical.com`, `/api/**` rewritten to Cloud Run per `firebase.json` — both keep standard server logs outside this site's own code.
- Cross-check `src/app/privacy/page.tsx` and `src/app/terms/page.tsx` against everything above and flag any mismatch explicitly — in particular, a claim that a processor (Turnstile, Resend) is active when its key isn't actually configured.

## Output

Write the findings to `LEGAL-FACT-SHEET.md` at the repo root (already gitignored — this is a working document for counsel, not site content) as a plain factual list: what's collected, from which form, sent to which named service, retained where. No policy language, no legal conclusions, no recommendations about what the policy *should* say — that's for the lawyer and, afterward, `write-copy` to implement.

End the document with a one-line reminder that this was generated from the current code and should be regenerated if the forms' fields, the API's integrations, or the analytics setup change — and again the day the API actually goes live, if it wasn't live when this was generated.
