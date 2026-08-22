"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Turnstile } from "./Turnstile";

// Same-origin — Firebase Hosting rewrites /api/** to the Cloud Run API.
// NEXT_PUBLIC_SIMULATE_FORMS is a local dev escape hatch only (see
// .env.example) — never set in production.
const SIMULATE = process.env.NEXT_PUBLIC_SIMULATE_FORMS === "true";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(
    "We'll write only when it matters. No newsletter."
  );
  const successRef = useRef<HTMLDivElement>(null);

  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  useEffect(() => {
    if (status === "success") {
      successRef.current?.focus();
    }
  }, [status]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!EMAIL_RE.test(email)) {
      setMessage("That doesn't look like an email — try again?");
      return;
    }

    setStatus("submitting");
    setMessage("");

    if (SIMULATE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatus("success");
      return;
    }

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, turnstileToken }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage("Something went wrong — please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not connect — please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="w-full max-w-md rounded-lg border border-success-500/40 bg-success-500/[0.06] p-4 text-center text-sm leading-relaxed text-text-1 outline-none"
      >
        Thank you.{" "}
        <em className="font-serif italic text-text-hover">
          We&rsquo;ll be in touch.
        </em>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-3"
      >
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <div className="flex w-full gap-2 rounded-lg border border-border bg-surface p-1.5 transition-shadow focus-within:border-signal-500 focus-within:shadow-[0_0_0_3px_theme(colors.signal.100)]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourcompany.com"
            aria-label="Email address"
            autoComplete="email"
            required
            aria-invalid={status === "error"}
            className="flex-1 border-0 bg-transparent px-3 py-2.5 text-[15px] text-text-1 outline-none placeholder:text-text-3"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="whitespace-nowrap rounded-md bg-cta px-4 py-2.5 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover disabled:cursor-default"
          >
            {status === "submitting" ? "Adding…" : "Notify me"}
          </button>
        </div>

        <Turnstile onToken={handleTurnstileToken} />
      </form>
      <div
        role="status"
        aria-live="polite"
        className="text-center font-mono text-[11px] uppercase tracking-[0.06em] text-text-3"
      >
        {message}
      </div>
    </div>
  );
}
