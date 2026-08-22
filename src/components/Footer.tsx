import Link from "next/link";
import { footerLinks } from "@/content/routes";
import { platforms } from "@/content/platforms";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { Container } from "./Container";
import { ObfuscatedEmail } from "./ObfuscatedEmail";
import { Wordmark } from "./Wordmark";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightYears =
    currentYear > site.founded
      ? `${site.founded}–${currentYear}`
      : `${site.founded}`;

  return (
    <footer className="border-t border-border bg-bg">
      <Container className="grid gap-10 py-16 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Wordmark className="text-xl" />
          <p className="max-w-sm text-sm leading-relaxed text-text-2">
            {site.description}
          </p>
        </div>

        <FooterColumn heading="Consulting">
          <FooterLink href="/services/">Services</FooterLink>
          {services.map((service) => (
            <FooterLink key={service.slug} href={`/services/${service.slug}/`}>
              {service.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn heading="Platforms">
          <FooterLink href="/platforms/">Platforms</FooterLink>
          {platforms.map((platform) => (
            <FooterLink key={platform.slug} href={`/platforms/${platform.slug}/`}>
              {platform.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn heading="Company">
          <FooterLink href="/about/">About</FooterLink>
          <FooterLink href="/process/">Process</FooterLink>
          <FooterLink href="/faq/">FAQ</FooterLink>
          <FooterLink href="/careers/">Careers</FooterLink>
          <FooterLink href="/contact/">Contact</FooterLink>
          <ObfuscatedEmail className="text-sm text-text-2 hover:text-text-1" />
        </FooterColumn>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-3 py-6 font-mono text-[11px] uppercase tracking-[0.1em] text-text-3 md:flex-row md:items-center md:justify-between">
          <span>
            &copy; {copyrightYears} {site.name}
          </span>
          {footerLinks.length > 0 && (
            <div className="flex gap-6">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-text-hover"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-3">
        {heading}
      </span>
      {children}
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-sm text-text-2 hover:text-text-1">
      {children}
    </Link>
  );
}
