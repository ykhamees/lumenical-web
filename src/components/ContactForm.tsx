"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Turnstile } from "./Turnstile";

// Same-origin — Firebase Hosting rewrites /api/** to the Cloud Run API, so
// no CORS, no configurable endpoint. NEXT_PUBLIC_SIMULATE_FORMS is a local
// dev escape hatch only (see .env.example) — never set in production.
const SIMULATE = process.env.NEXT_PUBLIC_SIMULATE_FORMS === "true";
// Turnstile's invisible/managed check runs asynchronously after the widget
// script loads — a few hundred ms at best. Unset in dev/local (no
// Cloudflare account), matching Turnstile.tsx's own gate, so this never
// blocks submission where the server-side check is skipped anyway.
const TURNSTILE_REQUIRED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROR_ID = "contact-form-error";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
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

    if (!name.trim() || !EMAIL_RE.test(email) || !message.trim()) {
      setError("Please fill in your name, a valid email, and a message.");
      return;
    }

    setError("");
    setStatus("submitting");

    if (SIMULATE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatus("success");
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          companySize,
          message,
          website,
          turnstileToken,
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        throw new Error("Request failed");
      }
    } catch {
      setStatus("error");
      setError("Could not send your message — please try again shortly.");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="rounded-lg border border-success-500/40 bg-success-500/[0.06] p-6 text-sm leading-relaxed text-text-1 outline-none"
      >
        Thank you, {name.split(" ")[0] || "there"}.{" "}
        <em className="font-serif italic text-text-hover">
          We&rsquo;ll be in touch within one business day.
        </em>
      </div>
    );
  }

  const invalid = status === "error" || Boolean(error);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            aria-invalid={invalid}
            aria-describedby={error ? ERROR_ID : undefined}
            className={inputClass}
          />
        </Field>
        <Field label="Work email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-invalid={invalid}
            aria-describedby={error ? ERROR_ID : undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Company size">
        <select
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
          className={inputClass}
        >
          <option value="">Select a range</option>
          <option value="1-4">1-4</option>
          <option value="5-20">5-20</option>
          <option value="21-50">21-50</option>
          <option value="51-100">51-100</option>
          <option value="100+">100+</option>
        </select>
      </Field>

      <Field label="How can we help?">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          aria-invalid={invalid}
          aria-describedby={error ? ERROR_ID : undefined}
          className={inputClass}
        />
      </Field>

      <Turnstile onToken={handleTurnstileToken} />

      <div aria-live="polite">
        {error && (
          <p id={ERROR_ID} role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={
          status === "submitting" || (TURNSTILE_REQUIRED && !turnstileToken)
        }
        className="w-fit rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover disabled:cursor-default"
      >
        {status === "submitting"
          ? "Sending…"
          : TURNSTILE_REQUIRED && !turnstileToken
            ? "Verifying…"
            : "Send message"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[15px] text-text-1 outline-none transition-colors focus:border-signal-500 focus:shadow-[0_0_0_3px_theme(colors.signal.100)]";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
        {label}
      </span>
      {children}
    </label>
  );
}
