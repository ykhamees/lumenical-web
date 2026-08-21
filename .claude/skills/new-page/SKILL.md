---
name: new-page
description: Scaffold a brand-new page/route for the Lumenical site (e.g. Careers, Blog, Case Studies) following the App Router conventions already established, and wire it into navigation and the sitemap. Use when the user wants to add an entirely new route to the site — not for editing an existing page.
when_to_use: "add a new page", "create a careers page", "add a blog to the site", "new route", "scaffold a page"
argument-hint: "[page name and purpose]"
context: fork
agent: lumenical-pages
---

Build the new page the user asked for: $ARGUMENTS

Follow this repo's established conventions exactly (App Router folder-per-route under `src/app/`, the `Container` layout primitive, Tailwind design tokens — including the dark-mode semantic classes like `bg-surface`/`text-text-2`, never the literal `ink-*`/`paper-*`/`bg-white` classes — from `tailwind.config.ts`/`globals.css`, page-specific structured content in a new `src/content/*.ts` file rather than inline JSX arrays, and `pageMetadata()` from `src/lib/seo.ts` for the page's metadata). Register the new route with one entry in `src/content/routes.ts` (`nav: true` if it belongs in navigation) — `navLinks`, `footerLinks`, and `src/app/sitemap.ts` all derive from that single list, so nothing else needs a second edit.

If the user's request didn't specify enough detail (what sections it needs, whether it belongs in the main nav), make a reasonable call consistent with the rest of the site rather than stalling — note the assumptions you made in your final report.

Finish by running `npm run build`, `npm run lint`, and `npx tsc --noEmit`, and confirm the new route shows `○ (Static)` in the build output.
