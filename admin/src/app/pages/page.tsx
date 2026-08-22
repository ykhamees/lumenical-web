import { Suspense } from "react";
import { PagesConsole } from "@/components/PagesConsole";

export default function AdminPagesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-3">Loading…</p>}>
      <PagesConsole />
    </Suspense>
  );
}
