"use client";

import { FormEvent, useState } from "react";

const SCRIPT_URL = process.env.NEXT_PUBLIC_NEWSLETTER_SCRIPT_URL ?? "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(
    "We'll write only when it matters. No newsletter."
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!EMAIL_RE.test(email)) {
      setMessage("That doesn't look like an email — try again?");
      return;
    }

    setStatus("submitting");
    setMessage("");

    if (!SCRIPT_URL) {
      // No backend configured yet — see README for setup.
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatus("success");
      return;
    }

    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.result === "success") {
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
      <div className="w-full max-w-md rounded-lg border border-success-500/40 bg-success-500/[0.06] p-4 text-center text-sm leading-relaxed text-ink-800">
        Thank you.{" "}
        <em className="font-serif not-italic italic text-ink-700">
          We&rsquo;ll be in touch.
        </em>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <form
        onSubmit={handleSubmit}
        className="flex w-full gap-2 rounded-lg border border-paper-300 bg-white p-1.5 transition-shadow focus-within:border-signal-500 focus-within:shadow-[0_0_0_3px_theme(colors.signal.100)]"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          aria-label="Email address"
          autoComplete="email"
          required
          className="flex-1 border-0 bg-transparent px-3 py-2.5 text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="whitespace-nowrap rounded-md bg-ink-900 px-4 py-2.5 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-700 disabled:cursor-default"
        >
          {status === "submitting" ? "Adding…" : "Notify me"}
        </button>
      </form>
      <div className="text-center font-mono text-[11px] uppercase tracking-[0.06em] text-ink-400">
        {message}
      </div>
    </div>
  );
}
