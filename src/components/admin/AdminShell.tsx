"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

const NAV_LINKS = [
  { href: "/admin/", label: "Dashboard" },
  { href: "/admin/leads/", label: "Leads" },
  { href: "/admin/newsletter/", label: "Newsletter" },
  { href: "/admin/pages/", label: "Pages" },
  { href: "/admin/demos/", label: "Demos" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { status, user, role, signOut } = useAdminAuth();
  const pathname = usePathname();

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
        <div className="flex items-center gap-6">
          <span className="font-mono text-sm uppercase tracking-[0.1em] text-text-label">
            Lumenical — Admin
          </span>
          <nav className="flex items-center gap-4">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm ${active ? "text-text-1" : "text-text-2 hover:text-text-hover"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
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
