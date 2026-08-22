"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
        }
      ) => string;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Renders nothing until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set (no Cloudflare
 * account exists yet) — forms send an empty turnstileToken in that case,
 * which the API only rejects if its own TURNSTILE_SECRET_KEY is configured.
 */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRenderedRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || widgetRenderedRef.current) return;
    if (!containerRef.current || !SITE_KEY || !window.turnstile) return;

    widgetRenderedRef.current = true;
    window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: onToken,
      "expired-callback": () => onToken(""),
    });
  }, [scriptLoaded, onToken]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
    </>
  );
}
