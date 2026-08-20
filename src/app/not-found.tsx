import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center justify-center py-24">
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
          404
        </p>
        <h1 className="font-serif text-4xl italic text-ink-800">
          Nothing here.
        </h1>
        <p className="max-w-sm text-[15px] leading-relaxed text-ink-600">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <Link
          href="/"
          className="rounded-md bg-ink-900 px-6 py-3 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-700"
        >
          Back to home
        </Link>
      </Container>
    </section>
  );
}
