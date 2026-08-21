---
name: write-copy
description: Draft or revise on-site marketing copy for the Lumenical site — headlines, service descriptions, about/mission text — matching the established brand voice, without inventing verifiable facts (pricing, certifications, client names, years in business). Use for any copywriting request that isn't a mechanical service-list edit (see add-service for that).
when_to_use: "rewrite the hero headline", "improve this copy", "make the about page sound better", "draft copy for X", "review our copy"
argument-hint: "[what to write or revise]"
context: fork
agent: lumenical-content
---

Copy task: $ARGUMENTS

Write or revise this in `src/content/site.ts`, `src/content/services.ts`, `src/content/platforms.ts`, `src/content/faq.ts`, or the relevant `src/app/**/page.tsx`, matching the existing brand voice (restrained, sentence case, no exclamation points, serif italic reserved for one statement per section). Do not invent specific verifiable claims — flag anything that needs real input with `[NEEDS INPUT: ...]` instead of making it up. Platform copy must be grounded in that product's own repo, and AI Platform's real customer must never be named (a national financial regulator, ~2,000 users, fully on-premises — no publication sign-off exists, `docs/build-plan.md` O-1). `/privacy/`, `/terms/`, and `hello@lumenical.com` are now published (D-4) — the email must always render through `src/components/ObfuscatedEmail.tsx`, never a raw `mailto:` or plain-text address, and `/privacy/`/`/terms/` must only describe processors actually wired in code (re-run `legal-fact-sheet` before touching either).
