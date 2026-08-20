import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${site.domain}`;
  const routes = ["", "services", "about", "contact"];

  return routes.map((route) => ({
    url: route ? `${base}/${route}/` : `${base}/`,
  }));
}
