import { site } from "@/content/site";

/**
 * JSON-LD structured data (schema.org Organization) so search engines can
 * associate the site with a real business entity. Deliberately generic
 * "Organization" rather than "LocalBusiness"/"ProfessionalService" — those
 * types imply a physical address, which this business doesn't have (online
 * only). Limited to facts stated elsewhere on the site (name, url,
 * description, contact email) — no invented phone number, hours, or
 * ratings; fabricated structured data risks a manual Google Search Console
 * action.
 */
export function OrganizationSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: `https://${site.domain}`,
    logo: `https://${site.domain}/favicon.svg`,
    description: site.description,
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@lumenical.com",
      contactType: "customer support",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
