import Link from "next/link";
import { Container } from "@/components/Container";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Wordmark } from "@/components/Wordmark";
import { audiences } from "@/content/site";
import { platforms } from "@/content/platforms";
import { services } from "@/content/services";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="dotfield" aria-hidden="true" />
        <Container className="relative flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <Wordmark className="text-[clamp(48px,12vw,140px)]" />
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
            AI & Software · Online
          </p>
          <h1 className="max-w-2xl font-serif text-[clamp(28px,4.5vw,48px)] italic leading-[1.15] tracking-tight text-text-1">
            AI and software, built for how you actually run.
          </h1>
        </Container>
      </section>

      {/* DUAL-AUDIENCE PATHS */}
      <section className="border-b border-border">
        <div className="grid md:grid-cols-2 md:divide-x md:divide-border">
          {audiences.map((audience) => (
            <div
              key={audience.key}
              className="flex flex-col gap-6 border-b border-border p-10 last:border-b-0 md:border-b-0 md:p-14"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
                {audience.eyebrow}
              </p>
              <h2 className="font-serif text-2xl italic text-text-1 md:text-3xl">
                {audience.headline}
              </h2>
              <p className="max-w-md text-[15px] leading-relaxed text-text-2">
                {audience.description}
              </p>

              <div className="flex gap-8 border-y border-border py-4">
                {audience.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <span className="font-serif text-2xl italic text-text-1">
                      {stat.value}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-3">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={audience.primaryCta.href}
                  className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
                >
                  {audience.primaryCta.label}
                </Link>
                <Link
                  href={audience.secondaryCta.href}
                  className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-1 transition-colors hover:border-ink-300"
                >
                  {audience.secondaryCta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DIFFERENTIATORS — both tracks */}
      <section className="py-24">
        <Container>
          <div className="mb-14 max-w-xl">
            <h2 className="font-serif text-3xl italic text-text-1 md:text-4xl">
              Why teams choose Lumenical
            </h2>
          </div>
          <div className="grid gap-12 md:grid-cols-2">
            {audiences.map((audience) => (
              <div key={audience.key} className="flex flex-col gap-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-3">
                  {audience.eyebrow}
                </p>
                {audience.differentiators.map((item) => (
                  <div key={item.title} className="flex flex-col gap-2">
                    <h3 className="text-base font-medium text-text-1">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-2">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SERVICES TEASER */}
      <section className="border-y border-border bg-surface-2 py-24">
        <Container>
          <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-3">
                For growing businesses
              </p>
              <h2 className="mt-2 font-serif text-3xl italic text-text-1 md:text-4xl">
                What we do
              </h2>
            </div>
            <Link
              href="/services/"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-link hover:text-text-1"
            >
              All services &rarr;
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.slug}
                className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6"
              >
                <h3 className="text-base font-medium text-text-1">
                  {service.name}
                </h3>
                <p className="text-sm leading-relaxed text-text-2">
                  {service.summary}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PLATFORMS TEASER */}
      <section className="py-24">
        <Container>
          <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-3">
                For institutions
              </p>
              <h2 className="mt-2 font-serif text-3xl italic text-text-1 md:text-4xl">
                What we build
              </h2>
            </div>
            <Link
              href="/platforms/"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-link hover:text-text-1"
            >
              All platforms &rarr;
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {platforms.map((platform) => (
              <div
                key={platform.slug}
                className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6"
              >
                <h3 className="text-base font-medium text-text-1">
                  {platform.name}
                </h3>
                <p className="text-sm leading-relaxed text-text-2">
                  {platform.summary}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA / NEWSLETTER */}
      <section className="border-t border-border py-24">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-lg font-serif text-3xl italic text-text-1 md:text-4xl">
            Let&rsquo;s talk about your setup.
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-text-2">
            Tell us where things stand today and where you&rsquo;re headed.
            We&rsquo;ll follow up with a straightforward read on what would
            help.
          </p>
          <Link
            href="/contact/"
            className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
          >
            Start the conversation
          </Link>

          <div className="mt-10 flex w-full flex-col items-center gap-3 border-t border-border pt-10">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-3">
              Or just stay in the loop
            </span>
            <NewsletterForm />
          </div>
        </Container>
      </section>
    </>
  );
}
