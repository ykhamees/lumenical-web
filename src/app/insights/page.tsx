import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { getPublishedPages } from "@/lib/cms";
import { getReadingTimeMinutes } from "@/lib/reading-time";
import { pageMetadata } from "@/lib/seo";

const baseMetadata = pageMetadata({
  title: "Insights",
  description: "Writing on AI, software, and the infrastructure behind them.",
  path: "insights",
});

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...baseMetadata.alternates,
    types: { "application/rss+xml": "/insights/rss.xml" },
  },
};

export default async function InsightsPage() {
  const pages = await getPublishedPages();

  return (
    <>
      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
            Insights
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            Writing on AI, software, and the infrastructure behind them.
          </h1>
        </Container>
      </section>

      <section className="py-20">
        <Container className="flex flex-col gap-10">
          {pages.length === 0 ? (
            <p className="text-center text-[15px] text-text-2">Insights are coming soon.</p>
          ) : (
            pages.map((page) => (
              <Link
                key={page.slug}
                href={`/insights/${page.slug}/`}
                className="group flex flex-col gap-2 border-b border-border pb-10 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.1em] text-text-3">
                  <span>{getReadingTimeMinutes(page.body)} min read</span>
                  {page.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2 py-0.5 text-text-2"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-serif text-2xl italic text-text-1 md:text-3xl">
                  {page.title}
                </h2>
                <p className="max-w-2xl text-[15px] leading-relaxed text-text-2">
                  {page.excerpt}
                </p>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-link transition-colors group-hover:text-text-1">
                  Read &rarr;
                </span>
              </Link>
            ))
          )}
        </Container>
      </section>
    </>
  );
}
