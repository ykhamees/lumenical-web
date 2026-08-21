"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

// Keeps Footer itself a server component (it computes the copyright year at
// build time — converting it to a client component would re-run that at
// hydration time too, risking a build-year-vs-view-year mismatch). This
// wrapper only decides whether to mount it at all.
export function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return <>{children}</>;
}
