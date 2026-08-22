import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms that apply to using the Lumenical website.",
  path: "terms",
});

export default function TermsPage() {
  return (
    <section className="py-20">
      <Container className="mx-auto flex max-w-2xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
            Terms
          </p>
          <h1 className="font-serif text-4xl italic text-text-1">
            Terms of service
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-3">
            Last updated August 21, 2026
          </p>
        </div>

        <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-text-2">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">
              Using this site
            </h2>
            <p>
              This site describes Lumenical&rsquo;s consulting services and
              platform products and lets you get in touch with us. By using
              it, you agree not to misuse it — no scraping it at a rate that
              disrupts it, no attempting to access anything not intended to
              be public, no using it to send spam or malicious content
              through our forms.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">
              Not professional advice
            </h2>
            <p>
              Nothing on this site — including the services, platforms,
              process, or FAQ pages — is a specific commitment, quote, or
              piece of advice for your situation. It describes what we
              generally do; an actual engagement is defined by what we
              agree with you directly, not by this website.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">
              Intellectual property
            </h2>
            <p>
              The content on this site — text, design, and the Lumenical
              name and mark — belongs to Lumenical. You&rsquo;re welcome to
              link to it; you don&rsquo;t have permission to copy or
              republish it as your own.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">
              No warranty
            </h2>
            <p>
              This site is provided as-is. We work to keep it accurate and
              available, but we don&rsquo;t guarantee it will be
              uninterrupted, error-free, or that everything on it stays
              current at every moment.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">Changes</h2>
            <p>
              We may update these terms as the site changes. If we do,
              we&rsquo;ll update the date at the top of this page.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">Questions</h2>
            <p>
              Email{" "}
              <ObfuscatedEmail className="text-link underline underline-offset-2 hover:text-text-1" />{" "}
              with anything about these terms.
            </p>
          </section>
        </div>
      </Container>
    </section>
  );
}
