import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { SoftwareApplicationSchema } from "@/components/SoftwareApplicationSchema";
import { platforms } from "@/content/platforms";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return platforms.map((platform) => ({ slug: platform.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const platform = platforms.find((p) => p.slug === slug);
  if (!platform) return {};

  return pageMetadata({
    title: platform.name,
    description: platform.summary,
    path: `platforms/${platform.slug}`,
  });
}

export default async function PlatformDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const platform = platforms.find((p) => p.slug === slug);
  if (!platform) notFound();

  return (
    <>
      <SoftwareApplicationSchema platform={platform} />

      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Platforms", href: "/platforms/" },
              { label: platform.name, href: `/platforms/${platform.slug}/` },
            ]}
          />
          <h1 className="max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            {platform.name}
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-text-2">
            {platform.description}
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium text-text-1">Capabilities</h2>
            <ul className="flex flex-col gap-2">
              {platform.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-[15px] leading-relaxed text-text-2"
                >
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lumen-500"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium text-text-1">Deployment</h2>
            <ul className="flex flex-col gap-2">
              {platform.deploymentModes.map((mode) => (
                <li
                  key={mode}
                  className="flex items-start gap-2 text-[15px] leading-relaxed text-text-2"
                >
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lumen-500"
                    aria-hidden="true"
                  />
                  {mode}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-16">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-lg font-serif text-3xl italic text-text-1 md:text-4xl">
            Let&rsquo;s talk about {platform.name}.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact/"
              className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
            >
              Get in touch
            </Link>
            <Link
              href="/platforms/"
              className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-1 transition-colors hover:border-ink-300"
            >
              All platforms
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
