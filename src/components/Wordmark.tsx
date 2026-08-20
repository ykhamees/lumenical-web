import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`mark ${className}`}>
      <span>lumen</span>
      <span className="ical">ical</span>
      <span className="pip" aria-hidden="true" />
    </span>
  );
}

export function WordmarkLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Lumenical home">
      <Wordmark className={className} />
    </Link>
  );
}
