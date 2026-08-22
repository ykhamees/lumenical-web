"use client";

import { FormEvent, useState } from "react";
import { useAdminAuth } from "@/lib/auth";

export function LoginForm() {
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      setError("Incorrect email or password.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h1 className="font-serif text-2xl text-text-1">Admin sign in</h1>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "admin-login-error" : undefined}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
          Password
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "admin-login-error" : undefined}
          className={inputClass}
        />
      </label>

      <div aria-live="polite">
        {error && (
          <p id="admin-login-error" role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta transition-colors hover:bg-cta-hover disabled:cursor-default"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[15px] text-text-1 outline-none transition-colors focus:border-signal-500 focus:shadow-[0_0_0_3px_theme(colors.signal.100)]";
