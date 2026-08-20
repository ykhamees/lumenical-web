import type { Metadata } from "next";
import { site } from "@/content/site";

/**
 * Per-page metadata isn't deep-merged with the root layout's by Next.js —
 * a page that only sets `title`/`description` silently inherits the root
 * layout's `openGraph`/`twitter` objects untouched (same title/url on every
 * page's social preview). This fills in the matching openGraph/twitter/
 * canonical fields so each page's link previews reflect that page.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `https://${site.domain}/${path}/`;
  const socialTitle = `${title} — ${site.name}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: site.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}
