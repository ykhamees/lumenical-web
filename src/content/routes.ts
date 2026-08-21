// Single source of truth for every public page's path, nav/footer
// membership, and sitemap inclusion. Adding a route means one entry here —
// navLinks, footerLinks, and sitemap.ts all derive from this list. Admin
// routes (once they exist) are excluded by simply never appearing here.

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
];

export const navLinks = routes
  .filter((route) => route.nav)
  .map((route) => ({ label: route.label, href: route.path }));

export const footerLinks = routes
  .filter((route) => route.footerLegal)
  .map((route) => ({ label: route.label, href: route.path }));

export const sitemapRoutes = routes.filter((route) => !route.noindex);
