import { Container } from "@/components/Container";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Careers",
  description: "How Lumenical hires, what we look for, and where to write.",
  path: "careers",
});

export default function CareersPage() {
  return (
    <>
      <section className="border-b border-border bg-surface-2">
        <Container className="flex flex-col gap-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
            Careers
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-4xl italic text-text-1 md:text-5xl">
            How we hire.
          </h1>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-medium text-text-1">
              No fixed schedule
            </h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              We bring people on when the work actually calls for it, not to
              fill a headcount plan. There&rsquo;s no running list of open
              roles on this page — if that changes, it&rsquo;ll say so here.
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-medium text-text-1">
              What we look for
            </h2>
            <p className="text-[15px] leading-relaxed text-text-2">
              Engineers who work across the stack instead of staying in one
              layer, who&rsquo;ve shipped real systems into production
              rather than just demoed them, and who are comfortable working
              entirely online with no fixed office.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface-2 py-20">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-lg font-serif text-3xl italic text-text-1 md:text-4xl">
            Where to write
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-text-2">
            Email{" "}
            <ObfuscatedEmail className="text-link underline underline-offset-2 hover:text-text-1" />{" "}
            with
            what you&rsquo;d want to work on and a link to something
            you&rsquo;ve built.
          </p>
        </Container>
      </section>
    </>
  );
}
