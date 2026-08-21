"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-1 items-center justify-center py-24">
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
          Error
        </p>
        <h1 className="font-serif text-4xl italic text-text-1">
          Something went wrong.
        </h1>
        <p className="max-w-sm text-[15px] leading-relaxed text-text-2">
          An unexpected error occurred. You can try again, or head back home.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-1 transition-colors hover:border-ink-300"
          >
            Back to home
          </Link>
        </div>
      </Container>
    </section>
  );
}
