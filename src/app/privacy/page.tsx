import { Container } from "@/components/Container";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "What information Lumenical collects and how it's used.",
  path: "privacy",
});

export default function PrivacyPage() {
  return (
    <section className="py-20">
      <Container className="mx-auto flex max-w-2xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
            Privacy
          </p>
          <h1 className="font-serif text-4xl italic text-text-1">
            Privacy policy
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-3">
            Last updated August 21, 2026
          </p>
        </div>

        <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-text-2">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">
              What we collect
            </h2>
            <p>
              If you subscribe for updates, we collect the email address you
              give us. If you submit the contact form, we collect your name,
              email address, company size, and whatever message you send —
              nothing more than what you type into those two forms.
            </p>
            <p>
              Submitting either form also briefly uses your IP address to
              prevent abuse — to stop the same visitor from submitting the
              form dozens of times in a few minutes. That check is
              short-lived and isn&rsquo;t tied to your name or email.
            </p>
            <p>
              We don&rsquo;t use tracking pixels, ad cookies, or any
              third-party marketing scripts, so we don&rsquo;t collect
              anything about you beyond that unless you send it to us
              directly.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">
              How we use it
            </h2>
            <p>
              Information you submit through the contact form is used to
              respond to you and nothing else. An email address you give us
              through the newsletter form is used only to send the
              occasional update you signed up for — we don&rsquo;t sell it,
              rent it, or hand it to a data broker.
            </p>
            <p>
              We use Cloudflare Turnstile to tell real visitors from bots
              before either form is accepted, and Resend to deliver the
              emails a submission triggers (a confirmation to you, a
              notification to us). Neither is active today — we&rsquo;ll
              update this page when either one is switched on.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">Analytics</h2>
            <p>
              We use Plausible, a cookieless analytics service, to
              understand overall traffic to this site. It doesn&rsquo;t use
              cookies or browser storage and doesn&rsquo;t identify you
              individually — we see aggregate numbers (which pages get
              visited, roughly how fast they load), not a profile tied to
              you. That&rsquo;s why this site doesn&rsquo;t need a cookie
              consent banner.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">
              Cookies and local storage
            </h2>
            <p>
              This site doesn&rsquo;t set any cookies. It stores one thing
              in your browser&rsquo;s local storage: whether you prefer
              light or dark mode. That preference stays on your device and
              is never sent to us.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">Hosting</h2>
            <p>
              This site is hosted on Firebase Hosting (a Google Cloud
              service). Like any web host, it keeps standard server logs —
              IP address, browser type, page requested, and timestamp — for
              the ordinary operation and security of the hosting
              infrastructure. We don&rsquo;t separately access or analyze
              those logs ourselves.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">
              How long we keep it
            </h2>
            <p>
              We keep what you send us for as long as it&rsquo;s useful for
              responding to you or, for newsletter subscribers, until you
              unsubscribe or ask us to remove it.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">
              Your options
            </h2>
            <p>
              You can ask what we hold about you, ask us to correct it, or
              ask us to delete it, at any time — email{" "}
              <ObfuscatedEmail className="text-link underline underline-offset-2 hover:text-text-1" />{" "}
              and we&rsquo;ll take care of it.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-text-1">Changes</h2>
            <p>
              If how we handle information changes in a meaningful way,
              we&rsquo;ll update this page and change the date at the top.
            </p>
          </section>
        </div>
      </Container>
    </section>
  );
}
