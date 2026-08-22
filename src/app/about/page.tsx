import Link from "next/link";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Lumenical is an online AI and software company — consulting for businesses of 5 to 100 people, and platforms for institutions.",
  path: "about",
});

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
            About
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            AI and software that grow with you, not around you.
          </h1>
        </Container>
      </section>

      <section className="border-b border-border py-20">
        <Container className="flex flex-col gap-6">
          <h2 className="text-xl font-medium text-text-1">
            Two tracks, one team
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-3">
                Consulting
              </p>
              <p className="text-[15px] leading-relaxed text-text-2">
                For businesses of 5 to 100 people: AI solutions, agentic AI
                platforms, and AI-powered workflows, plus the applications,
                cloud, and IT consulting behind them.{" "}
                <Link
                  href="/services/"
                  className="text-link underline underline-offset-2 hover:text-text-1"
                >
                  See the services
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-3">
                Platforms
              </p>
              <p className="text-[15px] leading-relaxed text-text-2">
                For institutions: agentic AI, integration middleware, and
                project and portfolio management, built to run on your own
                infrastructure.{" "}
                <Link
                  href="/platforms/"
                  className="text-link underline underline-offset-2 hover:text-text-1"
                >
                  See the platforms
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-medium text-text-1">
              Why we exist
            </h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              Businesses between 5 and 100 people sit in an awkward gap.
              They&rsquo;re too small to hire an in-house AI or engineering
              team, but too reliant on getting real, custom systems built to
              make do with whatever off-the-shelf software happens to fit
              closest. Institutions sit in a different one: they can build
              or buy AI, but rarely both on their own terms — most AI
              vendors expect them to hand data to someone else&rsquo;s
              cloud.
            </p>
            <p className="text-[15px] leading-relaxed text-text-2">
              Most AI and software vendors are built around enterprise
              contracts and long sales cycles that don&rsquo;t fit either
              gap. Lumenical is built for both: engineers who actually build
              the thing, pricing and deployment that scale with what you
              need, and AI that&rsquo;s judged by whether it does real work,
              not by how impressive the demo looks.
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-medium text-text-1">
              How we work
            </h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              Every engagement starts with understanding how you actually
              run today — the workflows, the tools, the constraints —
              before we design anything. We build in the open, ship
              incrementally, and hand over systems your team can actually
              maintain, not a black box only we understand.
            </p>
            <p className="text-[15px] leading-relaxed text-text-2">
              Whether it&rsquo;s an AI agent, a new application, or a
              platform running on your own infrastructure, the same team
              stays with it from design through to running in production.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface-2 py-20">
        <Container className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-medium text-text-1">
              Online, wherever you are
            </h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              Lumenical operates entirely online, with no fixed office —
              engineers work with your team remotely, the same way most of
              your own tools already do.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <p className="max-w-sm text-[15px] leading-relaxed text-text-2 md:text-right">
              Want to know more about how we work with a team like yours?
            </p>
            <Link
              href="/contact/"
              className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
            >
              Get in touch
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
