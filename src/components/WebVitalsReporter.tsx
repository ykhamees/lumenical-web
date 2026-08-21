"use client";

import { useReportWebVitals } from "next/web-vitals";

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number> }
    ) => void;
  }
}

/**
 * Forwards Core Web Vitals to Plausible as a custom event, if and only if
 * the Plausible script has actually loaded (i.e. NEXT_PUBLIC_PLAUSIBLE_DOMAIN
 * is set) — a no-op otherwise, never a separate reporting endpoint.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (typeof window.plausible !== "function") return;

    window.plausible("Web Vitals", {
      props: {
        metric: metric.name,
        value: Math.round(
          metric.name === "CLS" ? metric.value * 1000 : metric.value
        ),
        rating: metric.rating,
      },
    });
  });

  return null;
}
