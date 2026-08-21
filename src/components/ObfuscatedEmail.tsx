"use client";

import { useState } from "react";

const USER = "hello";
const DOMAIN = "lumenical.com";

/**
 * Renders as inert-looking text in the static HTML (defeats naive
 * scraping of the source); a real click swaps in the working mailto link.
 * Since this is a client component in a static export, the initial
 * `revealed = false` state is exactly what gets baked into the prerendered
 * HTML — the real address only appears in the DOM after a genuine
 * post-hydration click.
 */
export function ObfuscatedEmail({ className = "" }: { className?: string }) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <button type="button" onClick={() => setRevealed(true)} className={className}>
        {USER}&nbsp;[at]&nbsp;{DOMAIN}
      </button>
    );
  }

  return (
    <a href={`mailto:${USER}@${DOMAIN}`} className={className}>
      {USER}@{DOMAIN}
    </a>
  );
}
