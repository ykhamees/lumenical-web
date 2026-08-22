import type { MetadataRoute } from "next";

// Defense-in-depth alongside the root layout's `robots: { index: false }` —
// this app is a public subdomain (web-admin.lumenical.com) with no marketing
// content, so nothing on it should ever be crawled.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
