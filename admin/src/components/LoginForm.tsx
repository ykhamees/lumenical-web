"use client";

import { useState } from "react";
import { useAdminAuth } from "@/lib/auth";

export function LoginForm() {
  const { signIn, error } = useAdminAuth();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleClick() {
    setLocalError("");
    setSubmitting(true);
    try {
      await signIn();
    } catch {
      setLocalError("Sign-in failed or was cancelled.");
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = error || localError;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-serif text-2xl text-text-1">Admin sign in</h1>
      <p className="text-sm text-text-2">Sign in with your lumenical.com Google account.</p>

      <div aria-live="polite">
        {displayError && (
          <p role="alert" className="text-sm text-red-600">
            {displayError}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="flex w-fit items-center gap-3 rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-1 transition-colors hover:bg-surface-2 disabled:cursor-default"
      >
        <GoogleIcon />
        {submitting ? "Signing in…" : "Sign in with Google"}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}
