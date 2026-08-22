import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center justify-center py-24">
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
          404
        </p>
        <h1 className="font-serif text-4xl italic text-text-1">
          Nothing here.
        </h1>
        <p className="max-w-sm text-[15px] leading-relaxed text-text-2">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <Link
          href="/"
          className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
        >
          Back to home
        </Link>
      </Container>
    </section>
  );
}
