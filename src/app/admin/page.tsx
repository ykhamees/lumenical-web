"use client";

import { useAdminAuth } from "@/lib/admin-auth";

export default function AdminPage() {
  const { user, role } = useAdminAuth();

  return (
    <div>
      <h1 className="font-serif text-2xl text-text-1">Dashboard</h1>
      <p className="mt-2 text-sm text-text-2">
        Signed in as {user?.email} ({role}).
      </p>
    </div>
  );
}
