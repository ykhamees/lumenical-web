import { Suspense } from "react";
import { LeadsConsole } from "@/components/admin/LeadsConsole";

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-3">Loading…</p>}>
      <LeadsConsole />
    </Suspense>
  );
}
