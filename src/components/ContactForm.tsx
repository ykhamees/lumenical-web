"use client";

import { FormEvent, useState } from "react";

const FORM_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() || !EMAIL_RE.test(email) || !message.trim()) {
      setError("Please fill in your name, a valid email, and a message.");
      return;
    }

    setError("");
    setStatus("submitting");

    const payload = { name, email, companySize, message };

    if (!FORM_ENDPOINT) {
      // No backend configured yet — simulates success locally.
      // See README for wiring up a real submission endpoint.
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatus("success");
      return;
    }

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div className="rounded-lg border border-success-500/40 bg-success-500/[0.06] p-6 text-sm leading-relaxed text-ink-800">
        Thank you, {name.split(" ")[0] || "there"}.{" "}
        <em className="font-serif italic text-ink-700">
          We&rsquo;ll be in touch within one business day.
        </em>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
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
          className={inputClass}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-fit rounded-md bg-ink-900 px-6 py-3 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-700 disabled:cursor-default"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-paper-300 bg-white px-3 py-2.5 text-[15px] text-ink-900 outline-none transition-colors focus:border-signal-500 focus:shadow-[0_0_0_3px_theme(colors.signal.100)]";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-500">
        {label}
      </span>
      {children}
    </label>
  );
}
