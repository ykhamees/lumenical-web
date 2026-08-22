// Single source of truth for every public page's path, nav/footer
// membership, and sitemap inclusion. Adding a route means one entry here —
// navLinks, footerLinks, and sitemap.ts all derive from this list. The admin
// console (admin/) is a separate app entirely (see CLAUDE.md) and never
// appears here at all.

export type Route = {
  /** Trailing-slash path, matching this site's `trailingSlash: true` export. */
  path: string;
  label: string;
  /** Header nav + footer column membership. */
  nav?: boolean;
  /** Which dual-audience footer column this belongs to. Routes with no
   * track (e.g. Contact) keep their own dedicated footer column instead of
   * being grouped under a track. */
  track?: "consulting" | "platforms";
  /** Footer bottom-row secondary link (legal pages, etc.). */
  footerLegal?: boolean;
  /** Excluded from sitemap.xml and marked `robots: noindex` (admin, etc.). */
  noindex?: boolean;
};

// Read directly rather than importing @/lib/cms's isCmsLive() — that module
// is "server-only" (build-time Firestore reads), but this file is imported
// by client components too (Header.tsx), so it can only touch a plain
// NEXT_PUBLIC_* env var, never a server-only module.
const cmsLive = process.env.NEXT_PUBLIC_CMS_LIVE === "true";

export const routes: Route[] = [
  { path: "/", label: "Home" },
  { path: "/services/", label: "Services", nav: true, track: "consulting" },
  { path: "/platforms/", label: "Platforms", nav: true, track: "platforms" },
  { path: "/about/", label: "About", nav: true },
  { path: "/process/", label: "Process" },
  { path: "/faq/", label: "FAQ" },
  { path: "/careers/", label: "Careers" },
  { path: "/contact/", label: "Contact", nav: true },
  { path: "/privacy/", label: "Privacy", footerLegal: true },
  { path: "/terms/", label: "Terms", footerLegal: true },
  // Excluded from nav/footer/sitemap until the CMS is actually live
  // (docs/build-plan.md 5.1) — the pages exist and render a "coming soon"
  // state regardless, they're just not advertised until there's content.
  ...(cmsLive
    ? [
        { path: "/demos/", label: "Demos", nav: true } as Route,
        { path: "/insights/", label: "Insights", nav: true } as Route,
      ]
    : []),
];

export const navLinks = routes
  .filter((route) => route.nav)
  .map((route) => ({ label: route.label, href: route.path }));

export const footerLinks = routes
  .filter((route) => route.footerLegal)
  .map((route) => ({ label: route.label, href: route.path }));

export const sitemapRoutes = routes.filter((route) => !route.noindex);
