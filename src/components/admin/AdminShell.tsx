"use client";

import { type ReactNode } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export function AdminShell({ children }: { children: ReactNode }) {
  const { status, user, role, signOut } = useAdminAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-sm text-text-3">Loading…</p>
      </div>
    );
  }

  if (status === "signed-out") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    );
  }

  // Authenticated with Firebase Auth but no admin/editor custom claim — the
  // API's require_admin_user() would also reject this account, so no admin
  // data renders here either. Distinct from "signed-out" so the message is
  // accurate: credentials worked, the account just isn't provisioned.
  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-center">
        <div className="max-w-sm">
          <p className="text-sm text-text-1">
            Signed in as {user?.email}, but this account has no admin role.
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-4 text-sm text-link underline underline-offset-2 hover:text-text-hover"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="font-mono text-sm uppercase tracking-[0.1em] text-text-label">
          Lumenical — Admin
        </span>
        <div className="flex items-center gap-4 text-sm text-text-2">
          <span>{user?.email}</span>
          <span className="rounded-full border border-border-2 px-2 py-0.5 text-xs uppercase text-text-3">
            {role}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-link underline underline-offset-2 hover:text-text-hover"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
