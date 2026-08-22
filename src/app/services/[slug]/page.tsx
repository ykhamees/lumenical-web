import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { ServiceSchema } from "@/components/ServiceSchema";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata(
  props: PageProps<"/services/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};

  return pageMetadata({
    title: service.name,
    description: service.summary,
    path: `services/${service.slug}`,
  });
}

export default async function ServiceDetailPage(
  props: PageProps<"/services/[slug]">
) {
  const { slug } = await props.params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <>
      <ServiceSchema
        name={service.name}
        description={service.summary}
        slug={service.slug}
      />

      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services/" },
              { label: service.name, href: `/services/${service.slug}/` },
            ]}
          />
          <h1 className="max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            {service.name}
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-text-2">
            {service.description}
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium text-text-1">
              What&rsquo;s included
            </h2>
            <ul className="flex flex-col gap-2">
              {service.features.map((feature) => (
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
            <h2 className="text-xl font-medium text-text-1">
              What an engagement looks like
            </h2>
            <ul className="flex flex-col gap-2">
              {service.engagementLooksLike.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[15px] leading-relaxed text-text-2"
                >
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lumen-500"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface-2 py-16">
        <Container className="flex flex-col gap-6">
          <h2 className="text-xl font-medium text-text-1">What you get</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {service.whatYouGet.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-surface p-5 text-[15px] leading-relaxed text-text-2"
              >
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-lg font-serif text-3xl italic text-text-1 md:text-4xl">
            Let&rsquo;s talk about {service.name}.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact/"
              className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
            >
              Get in touch
            </Link>
            <Link
              href="/services/"
              className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-1 transition-colors hover:border-ink-300"
            >
              All services
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
