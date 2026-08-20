import Link from "next/link";
import { footerLinks, navLinks, site } from "@/content/site";
import { Container } from "./Container";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="border-t border-paper-300 bg-paper-50">
      <Container className="grid gap-10 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Wordmark className="text-xl" />
          <p className="max-w-sm text-sm leading-relaxed text-ink-600">
            {site.description}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-400">
            Site
          </span>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-600 hover:text-ink-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-400">
            Contact
          </span>
          <Link
            href="/contact/"
            className="text-sm text-ink-600 hover:text-ink-900"
          >
            Get in touch
          </Link>
        </div>
      </Container>

      <div className="border-t border-paper-300">
        <Container className="flex flex-col gap-3 py-6 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-400 md:flex-row md:items-center md:justify-between">
          <span>
            &copy; {site.founded} {site.name}
          </span>
          {footerLinks.length > 0 && (
            <div className="flex gap-6">
              {footerLinks.map((link) => (
                <a key={link.href} href={link.href} className="hover:text-ink-700">
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </Container>
      </div>
    </footer>
  );
}
