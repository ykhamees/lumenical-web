import { site } from "@/content/site";
import { getPublishedPages } from "@/lib/cms";

// `output: "export"` only supports GET Route Handlers combined with
// `dynamic = "force-static"` — generates a static rss.xml file at build
// time. A valid, empty channel when the CMS isn't live (@/lib/cms) rather
// than omitting the route.
export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const pages = await getPublishedPages();
  const base = `https://${site.domain}`;

  const items = pages
    .map((page) => {
      const url = `${base}/insights/${page.slug}/`;
      const pubDate = page.publishedAt ? new Date(page.publishedAt).toUTCString() : null;
      const categories = page.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("");

      return (
        `<item><title>${escapeXml(page.title)}</title>` +
        `<link>${url}</link>` +
        `<guid isPermaLink="true">${url}</guid>` +
        `<description>${escapeXml(page.excerpt)}</description>` +
        (pubDate ? `<pubDate>${pubDate}</pubDate>` : "") +
        categories +
        `</item>`
      );
    })
    .join("");

  const feed =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0"><channel>` +
    `<title>${escapeXml(site.name)} — Insights</title>` +
    `<description>Writing on AI, software, and the infrastructure behind them.</description>` +
    `<link>${base}/insights/</link>` +
    items +
    `</channel></rss>`;

  return new Response(feed, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
