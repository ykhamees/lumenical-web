import type { MetadataRoute } from "next";
import { sitemapRoutes } from "@/content/routes";
import { services } from "@/content/services";
import { platforms } from "@/content/platforms";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [...staticRoutes, ...serviceRoutes, ...platformRoutes];
}
