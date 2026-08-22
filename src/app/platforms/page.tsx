import Link from "next/link";
import { Container } from "@/components/Container";
import { platforms } from "@/content/platforms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Platforms",
  description:
    "Agentic AI, integration middleware, and project and portfolio management — built to run on your own infrastructure.",
  path: "platforms",
});

export default function PlatformsPage() {
  return (
    <>
      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
            Platforms
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            Software built for how your institution actually runs.
          </h1>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-text-2">
            Three products, each built to run on your own infrastructure —
            on-premises, self-hosted, or air-gapped — for institutions that
            can&rsquo;t hand their data to someone else&rsquo;s cloud.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container className="flex flex-col gap-10">
          {platforms.map((platform, i) => (
            <Link
              key={platform.slug}
              href={`/platforms/${platform.slug}/`}
              className="group grid gap-6 border-b border-border pb-10 last:border-b-0 last:pb-0 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8"
            >
              <span className="font-mono text-sm text-text-3">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="font-serif text-2xl italic text-text-1 md:text-3xl">
                  {platform.name}
                </h2>
                <p className="max-w-2xl text-[15px] leading-relaxed text-text-2">
                  {platform.summary}
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
            Not sure which one fits?
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-text-2">
            Tell us what you&rsquo;re running today and where it&rsquo;s
            falling short.
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
