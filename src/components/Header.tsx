"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navLinks } from "@/content/routes";
import { Container } from "./Container";
import { ThemeToggle } from "./ThemeToggle";
import { WordmarkLink } from "./Wordmark";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])"
    );
    focusable?.[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <Container className="flex items-center justify-between py-5">
        <WordmarkLink className="text-2xl" />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  active ? "text-text-1" : "text-text-3 hover:text-text-hover"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/contact/"
            className="rounded-md bg-cta px-4 py-2 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
          >
            Get in touch
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-2"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </Container>

      {open && (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="border-t border-border md:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-3 font-mono text-xs uppercase tracking-[0.12em] text-text-2 hover:bg-surface-2"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact/"
              className="mt-2 rounded-md bg-cta px-4 py-3 text-center text-sm font-medium text-on-cta"
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
