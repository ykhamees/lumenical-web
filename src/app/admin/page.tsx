"use client";

import Link from "next/link";
import { useAdminAuth } from "@/lib/admin-auth";

export default function AdminPage() {
  const { user, role } = useAdminAuth();

  return (
    <div>
      <h1 className="font-serif text-2xl text-text-1">Dashboard</h1>
      <p className="mt-2 text-sm text-text-2">
        Signed in as {user?.email} ({role}).
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/leads/"
          className="rounded-lg border border-border bg-surface p-5 hover:bg-surface-2"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
            Leads
          </span>
          <p className="mt-2 text-sm text-text-2">
            Review incoming leads, track status, and leave notes.
          </p>
        </Link>
        <Link
          href="/admin/newsletter/"
          className="rounded-lg border border-border bg-surface p-5 hover:bg-surface-2"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
            Newsletter
          </span>
          <p className="mt-2 text-sm text-text-2">
            View subscribers, export the list, and manage unsubscribes.
          </p>
        </Link>
        <Link
          href="/admin/pages/"
          className="rounded-lg border border-border bg-surface p-5 hover:bg-surface-2"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
            Pages
          </span>
          <p className="mt-2 text-sm text-text-2">
            Write and publish insights pages with a rich text editor.
          </p>
        </Link>
        <Link
          href="/admin/demos/"
          className="rounded-lg border border-border bg-surface p-5 hover:bg-surface-2"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
            Demos
          </span>
          <p className="mt-2 text-sm text-text-2">
            Manage product and case study demos before they go live.
          </p>
        </Link>
      </div>
    </div>
  );
}
