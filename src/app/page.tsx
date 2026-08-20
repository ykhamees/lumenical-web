import Link from "next/link";
import { Container } from "@/components/Container";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Wordmark } from "@/components/Wordmark";
import { differentiators, site, stats } from "@/content/site";
import { services } from "@/content/services";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-paper-300">
        <div className="dotfield" aria-hidden="true" />
        <Container className="relative flex flex-col items-center gap-8 py-24 text-center md:py-32">
          <Wordmark className="text-[clamp(56px,14vw,176px)]" />
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
            AI & Software · Online
          </p>
          <h1 className="max-w-3xl font-serif text-[clamp(32px,5vw,56px)] italic leading-[1.1] tracking-tight text-ink-800">
            AI that keeps pace with your business.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-600">
            {site.description} We handle the build, the infrastructure, and
            the strategy behind it — so your team can focus on the business.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact/"
              className="rounded-md bg-ink-900 px-6 py-3 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-700"
            >
              Get in touch
            </Link>
            <Link
              href="/services/"
              className="rounded-md border border-paper-300 bg-white px-6 py-3 text-sm font-medium text-ink-800 transition-colors hover:border-ink-300"
            >
              View services
            </Link>
          </div>
        </Container>
      </section>

      {/* STATS */}
      <section className="border-b border-paper-300 bg-paper-100">
        <Container className="grid grid-cols-3 divide-x divide-paper-300 py-10">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <span className="font-serif text-3xl italic text-ink-800 md:text-4xl">
                {stat.value}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">
                {stat.label}
              </span>
            </div>
          ))}
        </Container>
      </section>

      {/* DIFFERENTIATORS */}
      <section className="py-24">
        <Container>
          <div className="mb-14 max-w-xl">
            <h2 className="font-serif text-3xl italic text-ink-800 md:text-4xl">
              Why teams choose Lumenical
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {differentiators.map((item) => (
              <div key={item.title} className="flex flex-col gap-3">
                <h3 className="text-lg font-medium text-ink-900">
                  {item.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-ink-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SERVICES TEASER */}
      <section className="border-y border-paper-300 bg-paper-100 py-24">
        <Container>
          <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="font-serif text-3xl italic text-ink-800 md:text-4xl">
              What we do
            </h2>
            <Link
              href="/services/"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-signal-500 hover:text-ink-900"
            >
              All services &rarr;
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.slug}
                className="flex flex-col gap-3 rounded-lg border border-paper-300 bg-white p-6"
              >
                <h3 className="text-base font-medium text-ink-900">
                  {service.name}
                </h3>
                <p className="text-sm leading-relaxed text-ink-600">
                  {service.summary}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA / NEWSLETTER */}
      <section className="py-24">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-lg font-serif text-3xl italic text-ink-800 md:text-4xl">
            Let&rsquo;s talk about your setup.
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-ink-600">
            Tell us where things stand today and where you&rsquo;re headed.
            We&rsquo;ll follow up with a straightforward read on what would
            help.
          </p>
          <Link
            href="/contact/"
            className="rounded-md bg-ink-900 px-6 py-3 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-700"
          >
            Start the conversation
          </Link>

          <div className="mt-10 flex w-full flex-col items-center gap-3 border-t border-paper-300 pt-10">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-400">
              Or just stay in the loop
            </span>
            <NewsletterForm />
          </div>
        </Container>
      </section>
    </>
  );
}
