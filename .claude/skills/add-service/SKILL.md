---
name: add-service
description: Add, remove, or reorder a service offering on the Lumenical site. Edits src/content/services.ts, which both the homepage teaser grid and the full /services page render directly from — no separate registration needed elsewhere.
when_to_use: "add a new service", "we now offer X", "remove a service", "reorder the services list", "update our service lineup"
argument-hint: "[service name and what it covers]"
---

`src/content/services.ts` is the single source of truth for services — `src/app/page.tsx` (homepage teaser cards), `src/app/services/page.tsx` (teaser list with anchors, linking through), and `src/app/services/[slug]/page.tsx` (the full detail page, via `generateStaticParams`) all map over the exported `services` array directly. Adding, removing, or reordering an entry there is the entire change; nothing else needs manual registration — the detail page, its `Service` JSON-LD, breadcrumbs, and sitemap entry are all generated from the array.

## Scope check before adding anything

The business owner has explicitly scoped Lumenical to exactly six disciplines: AI Solutions, Agentic AI Platforms, AI-Powered Business Workflows, Applications & Web Development, Cloud Consulting, IT Consulting — "we do not do anything outside what I've just mentioned." Before adding a new entry, check whether it's genuinely a new angle on one of those six or a different category entirely (e.g. a standalone cybersecurity, helpdesk, or backup/disaster-recovery service — that was the site's old, since-abandoned MSP positioning). If it doesn't clearly fit inside the six, confirm with the user before adding it rather than assuming it belongs.

## Adding a service

Append an object matching the existing `Service` type shape:

```ts
{
  slug: "kebab-case-id",       // becomes the #anchor on /services and the /services/[slug] URL
  name: "Service Name",
  summary: "One sentence, shown on homepage cards and as the /services teaser line.",
  description: "Two to three sentences, shown at the top of the /services/[slug] detail page.",
  features: ["Feature one", "Feature two", "Feature three", "Feature four"],
  engagementLooksLike: ["Step or theme one", "Step or theme two", "Step or theme three"],
  whatYouGet: ["Concrete deliverable one", "Concrete deliverable two", "Concrete deliverable three"],
}
```

`engagementLooksLike` and `whatYouGet` are required — they render as the two extra sections on the detail page (`src/app/services/[slug]/page.tsx`) alongside `features`. Match the tone of existing entries in the file — plain-English, specific to the 5-to-100-employee / online-only framing (no city, region, or office should ever be attributed to the business), no invented certifications, numbers, or specific timeframes for how an engagement runs. If the user hasn't given you enough detail to write a confident description, ask rather than inventing service specifics wholesale — unlike general marketing copy, a listed *service* reads as a concrete claim about what the company actually does.

## Removing or reordering

Just delete or move the object in the array — the numbered list on `/services` (`String(i + 1).padStart(2, "0")`) renumbers automatically from array order, and homepage cards follow the same order.

## Before finishing

Run `npm run build` and load `/services/` in a running dev server (or check the build output route list) to confirm the new entry renders and the anchor works. If this changes the total count of services in a way that makes any surrounding copy inaccurate (e.g. a page that says "six services"), fix that copy too — grep for the old count first.
