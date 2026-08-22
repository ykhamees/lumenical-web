import Link from "next/link";
import { Container } from "@/components/Container";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "AI solutions, agentic AI platforms, AI-powered workflows, applications and web development, cloud consulting, and IT consulting for businesses of 5 to 100 people.",
  path: "services",
});

export default function ServicesPage() {
  return (
    <>
      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
            Services
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            AI, software, and the infrastructure behind them.
          </h1>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-text-2">
            Engagements are scoped to what a 5-to-100 person business
            actually needs — mix and match, or hand us the whole stack.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container className="flex flex-col gap-10">
          {services.map((service, i) => (
            <Link
              key={service.slug}
              id={service.slug}
              href={`/services/${service.slug}/`}
              className="group grid scroll-mt-24 gap-6 border-b border-border pb-10 last:border-b-0 last:pb-0 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8"
            >
              <span className="font-mono text-sm text-text-3">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="font-serif text-2xl italic text-text-1 md:text-3xl">
                  {service.name}
                </h2>
                <p className="max-w-2xl text-[15px] leading-relaxed text-text-2">
                  {service.summary}
                </p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-link transition-colors group-hover:text-text-1">
                Learn more &rarr;
              </span>
            </Link>
          ))}
        </Container>
      </section>

      <section className="border-t border-border bg-surface-2 py-20">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-lg font-serif text-3xl italic text-text-1 md:text-4xl">
            Not sure what you need yet?
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-text-2">
            Most engagements start with a short conversation about where
            things stand today.
          </p>
          <Link
            href="/contact/"
            className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
          >
            Get in touch
          </Link>
        </Container>
      </section>
    </>
  );
}
