import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleSchema } from "@/components/ArticleSchema";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { SanitizedHtml } from "@/components/SanitizedHtml";
import { getPublishedPageBySlug, getPublishedPages, toSlugParams } from "@/lib/cms";
import { getReadingTimeMinutes } from "@/lib/reading-time";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return toSlugParams(await getPublishedPages());
}

export async function generateMetadata(
  props: PageProps<"/insights/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) return {};

  return pageMetadata({
    title: page.seo.title || page.title,
    description: page.seo.description || page.excerpt,
    path: `insights/${page.slug}`,
  });
}

export default async function InsightArticlePage(props: PageProps<"/insights/[slug]">) {
  const { slug } = await props.params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <ArticleSchema
        title={page.title}
        description={page.excerpt}
        slug={page.slug}
        publishedAt={page.publishedAt}
        updatedAt={page.updatedAt}
      />

      <section className="border-b border-border bg-surface-2">
        <Container className="flex max-w-3xl flex-col gap-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Insights", href: "/insights/" },
              { label: page.title, href: `/insights/${page.slug}/` },
            ]}
          />
          <h1 className="font-serif text-4xl italic text-text-1 md:text-5xl">{page.title}</h1>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.1em] text-text-3">
            <span>{getReadingTimeMinutes(page.body)} min read</span>
            {page.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-text-2">
                {tag}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-3xl">
          <SanitizedHtml html={page.body} />
        </Container>
      </section>

      <section className="border-t border-border bg-surface-2 py-16">
        <Container className="flex flex-col items-center gap-6 text-center">
          <Link
            href="/insights/"
            className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-1 transition-colors hover:border-ink-300"
          >
            All insights
          </Link>
        </Container>
      </section>
    </>
  );
}
