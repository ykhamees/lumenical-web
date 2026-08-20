import Link from "next/link";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Lumenical is an online AI and software consultancy built for businesses of 5 to 100 people.",
  path: "about",
});

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-paper-300 bg-paper-100">
        <Container className="flex flex-col gap-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
            About
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-4xl italic text-ink-800 md:text-5xl">
            AI and software that grow with you, not around you.
          </h1>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-medium text-ink-900">
              Why we exist
            </h2>
            <p className="text-[15px] leading-relaxed text-ink-600">
              Businesses between 5 and 100 people sit in an awkward gap.
              They&rsquo;re too small to hire an in-house AI or engineering
              team, but too reliant on getting real, custom systems built to
              make do with whatever off-the-shelf software happens to fit
              closest.
            </p>
            <p className="text-[15px] leading-relaxed text-ink-600">
              Most AI and software vendors are built around enterprise
              contracts and long sales cycles that don&rsquo;t fit a
              20-person company. Lumenical is built specifically for that
              gap: engineers who actually build the thing, pricing that
              scales with what you need instead of jumping in
              enterprise-sized steps, and AI that&rsquo;s judged by whether
              it does real work, not by how impressive the demo looks.
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-medium text-ink-900">
              How we work
            </h2>
            <p className="text-[15px] leading-relaxed text-ink-600">
              Every engagement starts with understanding how your business
              actually runs today — the workflows, the tools, the
              bottlenecks — before we design anything. We build in the
              open, ship incrementally, and hand over systems your team can
              actually maintain, not a black box only we understand.
            </p>
            <p className="text-[15px] leading-relaxed text-ink-600">
              Whether it&rsquo;s an AI agent, a new application, or the
              cloud infrastructure underneath it, the same team stays with
              it from design through to running in production.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-paper-300 bg-paper-100 py-20">
        <Container className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-medium text-ink-900">
              Online, wherever you are
            </h2>
            <p className="text-[15px] leading-relaxed text-ink-600">
              Lumenical operates entirely online, with no fixed office —
              engineers work with your team remotely, the same way most of
              your own tools already do.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <p className="max-w-sm text-[15px] leading-relaxed text-ink-600 md:text-right">
              Want to know more about how we work with a team like yours?
            </p>
            <Link
              href="/contact/"
              className="rounded-md bg-ink-900 px-6 py-3 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-700"
            >
              Get in touch
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
