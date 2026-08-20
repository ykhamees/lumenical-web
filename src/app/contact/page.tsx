import { Container } from "@/components/Container";
import { ContactForm } from "@/components/ContactForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with the Lumenical team — tell us about your setup and we'll follow up within one business day.",
  path: "contact",
});

export default function ContactPage() {
  return (
    <section className="py-20">
      <Container className="grid gap-16 md:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
            Contact
          </p>
          <h1 className="font-serif text-4xl italic text-ink-800">
            Let&rsquo;s talk.
          </h1>
          <p className="max-w-sm text-[15px] leading-relaxed text-ink-600">
            Tell us a bit about your team and what&rsquo;s prompting the
            conversation. We reply within one business day.
          </p>
        </div>

        <div className="rounded-lg border border-paper-300 bg-white p-6 md:p-8">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
