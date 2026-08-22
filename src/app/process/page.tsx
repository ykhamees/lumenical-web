import Link from "next/link";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Process",
  description:
    "How a Lumenical engagement actually runs — for consulting clients and for institutions deploying a platform.",
  path: "process",
});

const sharedSteps = [
  {
    title: "A conversation about where things stand",
    body: "Before anything is designed, we walk through how things actually run today — the workflows, the tools, the constraints that aren't written down anywhere.",
  },
  {
    title: "A scoped plan",
    body: "What gets built, in what order, and what's explicitly out of scope — agreed before any work starts, not discovered halfway through.",
  },
  {
    title: "Incremental delivery",
    body: "Built and shipped in pieces you can see and react to, not one long build that only surfaces at the end.",
  },
  {
    title: "Handover, not a black box",
    body: "Documentation and systems your team can actually maintain — the same team that built it stays with it into production.",
  },
];

export default function ProcessPage() {
  return (
    <>
      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
            Process
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            How an engagement actually runs.
          </h1>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-text-2">
            The shape is the same whether you&rsquo;re a growing business or
            an institution deploying a platform — only the specifics change.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {sharedSteps.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-3">
              <span className="font-mono text-sm text-text-3">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="text-base font-medium text-text-1">
                {step.title}
              </h2>
              <p className="text-sm leading-relaxed text-text-2">
                {step.body}
              </p>
            </div>
          ))}
        </Container>
      </section>

      <section className="border-t border-border bg-surface-2 py-20">
        <Container className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
              For growing businesses
            </p>
            <h2 className="font-serif text-2xl italic text-text-1">
              Engagements scale with what you need
            </h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              Mix and match from the six consulting disciplines, or hand us
              the whole stack. Every engagement ends in something running in
              production — not a proof of concept that sits on a shelf.
            </p>
            <Link
              href="/services/"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-link hover:text-text-1"
            >
              View services &rarr;
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
              For institutions
            </p>
            <h2 className="font-serif text-2xl italic text-text-1">
              Deployment fit for how you run
            </h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              On-premises, self-hosted, or air-gapped, sized to your
              institution, with a governance console in place from day one
              — not bolted on after something goes wrong.
            </p>
            <Link
              href="/platforms/"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-link hover:text-text-1"
            >
              View platforms &rarr;
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-lg font-serif text-3xl italic text-text-1 md:text-4xl">
            Most engagements start with a short conversation.
          </h2>
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
