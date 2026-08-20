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
      <section className="border-b border-paper-300 bg-paper-100">
        <Container className="flex flex-col gap-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
            Services
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-4xl italic text-ink-800 md:text-5xl">
            AI, software, and the infrastructure behind them.
          </h1>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-ink-600">
            Engagements are scoped to what a 5-to-100 person business
            actually needs — mix and match, or hand us the whole stack.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container className="flex flex-col gap-16">
          {services.map((service, i) => (
            <div
              key={service.slug}
              id={service.slug}
              className="grid scroll-mt-24 gap-8 border-b border-paper-300 pb-16 last:border-b-0 last:pb-0 md:grid-cols-[auto_1fr] md:gap-16"
            >
              <span className="font-mono text-sm text-ink-300">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-4">
                <h2 className="font-serif text-2xl italic text-ink-800 md:text-3xl">
                  {service.name}
                </h2>
                <p className="max-w-2xl text-[15px] leading-relaxed text-ink-600">
                  {service.description}
                </p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-ink-700"
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
            </div>
          ))}
        </Container>
      </section>

      <section className="border-t border-paper-300 bg-paper-100 py-20">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-lg font-serif text-3xl italic text-ink-800 md:text-4xl">
            Not sure what you need yet?
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-ink-600">
            Most engagements start with a short conversation about where
            things stand today.
          </p>
          <Link
            href="/contact/"
            className="rounded-md bg-ink-900 px-6 py-3 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-700"
          >
            Get in touch
          </Link>
        </Container>
      </section>
    </>
  );
}
