import type { MetadataRoute } from "next";
import { sitemapRoutes } from "@/content/routes";
import { services } from "@/content/services";
import { platforms } from "@/content/platforms";
import { site } from "@/content/site";
import { getPublishedDemos, getPublishedPages } from "@/lib/cms";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${site.domain}`;

  const staticRoutes = sitemapRoutes.map((route) => ({
    url: `${base}${route.path}`,
  }));

  const serviceRoutes = services.map((service) => ({
    url: `${base}/services/${service.slug}/`,
  }));

  const platformRoutes = platforms.map((platform) => ({
    url: `${base}/platforms/${platform.slug}/`,
  }));

  // Naturally empty until the CMS is live (@/lib/cms) — see routes.ts for
  // why the index pages themselves are also excluded from nav until then.
  const [demos, pages] = await Promise.all([getPublishedDemos(), getPublishedPages()]);
  const demoRoutes = demos.map((demo) => ({ url: `${base}/demos/${demo.slug}/` }));
  const insightRoutes = pages.map((page) => ({ url: `${base}/insights/${page.slug}/` }));

  return [...staticRoutes, ...serviceRoutes, ...platformRoutes, ...demoRoutes, ...insightRoutes];
}
