import { Suspense } from "react";
import { DemosConsole } from "@/components/admin/DemosConsole";

export default function AdminDemosPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-3">Loading…</p>}>
      <DemosConsole />
    </Suspense>
  );
}
