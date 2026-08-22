import { site } from "@/content/site";

/**
 * schema.org Service — same rule as OrganizationSchema: only facts stated on
 * the page itself (name, description). No invented ratings, prices, or areas
 * served.
 */
export function ServiceSchema({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `https://${site.domain}/services/${slug}/`,
    provider: {
      "@type": "Organization",
      name: site.name,
      url: `https://${site.domain}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
