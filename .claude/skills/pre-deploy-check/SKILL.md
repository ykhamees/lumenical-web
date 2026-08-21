---
name: pre-deploy-check
description: Run the full pre-ship verification pass on the Lumenical site — build, lint, type-check, route spot-checks, and design/convention drift checks. Use before pushing to main, after any non-trivial change, or whenever the user asks "is this ready to ship" / "does everything still work".
when_to_use: "is this ready to deploy", "check everything still works", "pre-deploy check", "run a final check before pushing"
context: fork
agent: lumenical-qa
---

Run the full verification pass on the current working tree: `npm run build`, `npm run lint`, `npx tsc --noEmit`, a route-by-route HTTP spot-check against a local dev server, and the drift checks:

- Raw hex colors outside `tailwind.config.ts` (the design-token layer) and `opengraph-image.tsx` (the sole, deliberate exception — Satori can't read Tailwind).
- A duplicate font-loading path outside `layout.tsx`.
- Stale copy left behind after a content edit.
- Every top-level `src/app/**/page.tsx` route segment has a matching entry in `src/content/routes.ts` (the single source of truth `navLinks`/`footerLinks` derive from) — a page with no registry entry, or a registry entry with no page, is drift. The `/services/[slug]/` and `/platforms/[slug]/` detail routes aren't in `routes.ts`; check instead that `sitemap.ts` enumerates them from `services.ts`/`platforms.ts` and that both arrays still have exactly six/three entries.
- No `text-ink-400` (or `placeholder:text-ink-400`) on real text anywhere outside `globals.css`'s `.mark .ical` — it's a non-text ink per the design system and fails AA contrast; use `text-text-3` instead.
- `hello@lumenical.com` (D-4, published) must only ever render via `src/components/ObfuscatedEmail.tsx` — `grep -rn "mailto:" src/` and confirm the only hit outside that component is `OrganizationSchema.tsx`'s JSON-LD (deliberately plain there).
- `/privacy/` and `/terms/` must match `LEGAL-FACT-SHEET.md` — if either page or the forms'/analytics' configuration changed without the fact sheet being regenerated, flag it as drift.
- `src/content/platforms.ts`'s AI Platform entry names no specific institution, ministry, country, or region — only "a national financial regulator, ~2,000 users, fully on-premises" is cleared for publication (`docs/build-plan.md` O-1, no sign-off for a real name exists). Treat any more specific detail as a blocking finding.

Report pass/fail per step plainly. If something fails, report the exact failure — don't attempt to silently fix it and re-report success; that decision belongs to whoever asked for the check.
