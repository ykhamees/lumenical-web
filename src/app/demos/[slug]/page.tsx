import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { SanitizedHtml } from "@/components/SanitizedHtml";
import { getPublishedDemoBySlug, getPublishedDemos, toSlugParams } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return toSlugParams(await getPublishedDemos());
}

export async function generateMetadata(
  props: PageProps<"/demos/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const demo = await getPublishedDemoBySlug(slug);
  if (!demo) return {};

  return pageMetadata({
    title: demo.seo.title || demo.title,
    description: demo.seo.description || demo.summary,
    path: `demos/${demo.slug}`,
  });
}

export default async function DemoDetailPage(props: PageProps<"/demos/[slug]">) {
  const { slug } = await props.params;
  const demo = await getPublishedDemoBySlug(slug);
  if (!demo) notFound();

  return (
    <>
      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Demos", href: "/demos/" },
              { label: demo.title, href: `/demos/${demo.slug}/` },
            ]}
          />
          <h1 className="max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            {demo.title}
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-text-2">{demo.summary}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-3xl">
          <SanitizedHtml html={demo.body} />
        </Container>
      </section>

      <section className="border-t border-border bg-surface-2 py-16">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-lg font-serif text-3xl italic text-text-1 md:text-4xl">
            Want something like this?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact/"
              className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
            >
              Get in touch
            </Link>
            <Link
              href="/demos/"
              className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-1 transition-colors hover:border-ink-300"
            >
              All demos
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
