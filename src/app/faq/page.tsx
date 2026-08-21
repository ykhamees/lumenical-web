import Link from "next/link";
import { Container } from "@/components/Container";
import { FaqSchema } from "@/components/FaqSchema";
import { faqs } from "@/content/faq";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Common questions from both growing businesses and institutions about how Lumenical works.",
  path: "faq",
});

export default function FaqPage() {
  return (
    <>
      <FaqSchema faqs={faqs} />

      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
            FAQ
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            Questions we actually get asked.
          </h1>
        </Container>
      </section>

      <section className="py-20">
        <Container className="mx-auto max-w-2xl">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border-b border-border py-6 first:pt-0 last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-text-1 marker:content-none [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  className="shrink-0 text-lg text-text-3 transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 text-[15px] leading-relaxed text-text-2">
                {faq.answer}
              </p>
            </details>
          ))}
        </Container>
      </section>

      <section className="border-t border-border bg-surface-2 py-20">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-lg font-serif text-3xl italic text-text-1 md:text-4xl">
            Didn&rsquo;t find your question?
          </h2>
          <Link
            href="/contact/"
            className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
          >
            Ask us directly
          </Link>
        </Container>
      </section>
    </>
  );
}
