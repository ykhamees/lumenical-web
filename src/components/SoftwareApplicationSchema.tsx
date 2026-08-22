import { site } from "@/content/site";
import type { Platform } from "@/content/platforms";

/**
 * JSON-LD SoftwareApplication schema, extending OrganizationSchema.tsx's
 * existing rule: only facts stated on the page — no invented ratings,
 * prices, or review counts.
 */
export function SoftwareApplicationSchema({ platform }: { platform: Platform }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Lumenical ${platform.name}`,
    description: platform.summary,
    url: `https://${site.domain}/platforms/${platform.slug}/`,
    applicationCategory: "BusinessApplication",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
