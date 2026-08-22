import { site } from "@/content/site";

/**
 * schema.org Article — same rule as OrganizationSchema/ServiceSchema: only
 * facts stated on the page (title, description, dates). No invented image
 * (pages have no cover-image field) or ratings.
 */
export function ArticleSchema({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string | null;
  updatedAt: string | null;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `https://${site.domain}/insights/${slug}/`,
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    author: { "@type": "Organization", name: site.name, url: `https://${site.domain}` },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `https://${site.domain}/favicon.svg` },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
