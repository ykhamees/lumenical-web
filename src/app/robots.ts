import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin console (admin/) is a separate app served at
      // lumenical.com/website/** via a firebase.json Hosting rewrite — it
      // has its own robots.ts too, but that's at /website/robots.txt, a
      // non-standard location crawlers won't check, so it's disallowed
      // from here, the real site root, instead.
      disallow: "/website/",
    },
    sitemap: `https://${site.domain}/sitemap.xml`,
  };
}
