import Link from "next/link";
import { Container } from "@/components/Container";
import { getPublishedDemos } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Demos",
  description: "Products and case studies built by Lumenical — our own work, not client stories.",
  path: "demos",
});

export default async function DemosPage() {
  const demos = await getPublishedDemos();

  return (
    <>
      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">Demos</p>
          <h1 className="mx-auto max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            What we&rsquo;ve built.
          </h1>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-text-2">
            Products and case studies — our own work, shown directly rather than described.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container className="flex flex-col gap-10">
          {demos.length === 0 ? (
            <p className="text-center text-[15px] text-text-2">
              Demos are coming soon.
            </p>
          ) : (
            demos.map((demo, i) => (
              <Link
                key={demo.slug}
                href={`/demos/${demo.slug}/`}
                className="group grid gap-6 border-b border-border pb-10 last:border-b-0 last:pb-0 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8"
              >
                <span className="font-mono text-sm text-text-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-2">
                  <h2 className="font-serif text-2xl italic text-text-1 md:text-3xl">
                    {demo.title}
                  </h2>
                  <p className="max-w-2xl text-[15px] leading-relaxed text-text-2">
                    {demo.summary}
                  </p>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-link transition-colors group-hover:text-text-1">
                  View &rarr;
                </span>
              </Link>
            ))
          )}
        </Container>
      </section>
    </>
  );
}
