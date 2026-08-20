"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/content/site";
import { Container } from "./Container";
import { WordmarkLink } from "./Wordmark";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-paper-300 bg-paper-50/90 backdrop-blur">
      <Container className="flex items-center justify-between py-5">
        <WordmarkLink className="text-2xl" />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? "text-ink-900"
                    : "text-ink-400 hover:text-ink-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/contact/"
            className="rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-700"
          >
            Get in touch
          </Link>
        </nav>

        <button
          type="button"
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-600 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </Container>

      {open && (
        <div id="mobile-nav" className="border-t border-paper-300 md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-3 font-mono text-xs uppercase tracking-[0.12em] text-ink-600 hover:bg-paper-100"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact/"
              className="mt-2 rounded-md bg-ink-900 px-4 py-3 text-center text-sm font-medium text-paper-50"
              onClick={() => setOpen(false)}
            >
              Get in touch
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
