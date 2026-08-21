"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { listLeads } from "@/lib/admin-leads-api";
import { formatDateTime } from "@/lib/admin-format";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/admin-types";
import { LeadDrawer } from "./LeadDrawer";
import { StatusPill } from "./StatusPill";

const PAGE_SIZE = 25;

export function LeadsConsole() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedLeadId = searchParams.get("lead");

  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  // Bumped whenever the drawer changes a lead's status — forces the table
  // to refetch instead of patching the row in place, since a status change
  // can move a lead out of the current filter (e.g. filtered to "new",
  // then changed to "contacted") and only the server knows the new page.
  const [refreshKey, setRefreshKey] = useState(0);

  function openLead(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lead", id);
    router.push(`${pathname}?${params}`);
  }

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lead");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-text-1">Leads</h1>
        <label className="flex items-center gap-2 text-sm text-text-2">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-1 outline-none focus:border-signal-500"
          >
            <option value="all">All</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Keyed by statusFilter: switching filters mounts a fresh table
          with its own fresh loading/error/leads state, rather than
          resetting that state imperatively in an effect. */}
      <LeadsTable
        key={`${statusFilter}-${refreshKey}`}
        statusFilter={statusFilter}
        onOpenLead={openLead}
      />

      {selectedLeadId && (
        <LeadDrawer
          key={selectedLeadId}
          leadId={selectedLeadId}
          onClose={closeDrawer}
          onStatusChanged={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

function LeadsTable({
  statusFilter,
  onOpenLead,
}: {
  statusFilter: LeadStatus | "all";
  onOpenLead: (id: string) => void;
}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // No synchronous setState here on purpose — this component is keyed by
  // statusFilter (see LeadsConsole), so a filter change mounts a fresh
  // instance whose useState defaults already cover the reset. All
  // setState calls below live inside the .then/.catch/.finally callbacks.
  useEffect(() => {
    let cancelled = false;
    listLeads({ status: statusFilter, cursor: null, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setLeads(data.items);
        setNextCursor(data.nextCursor);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load leads.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  async function handleLoadMore() {
    setLoadingMore(true);
    setError("");
    try {
      const data = await listLeads({ status: statusFilter, cursor: nextCursor, limit: PAGE_SIZE });
      setLeads((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      setError("Could not load more leads.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <div aria-live="polite">
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-2 text-text-label">
            <tr>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Name</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Email</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">
                Company size
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Status</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Received</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-3">
                  Loading…
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-3">
                  No leads yet.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpenLead(lead.id)}
                      className="text-left text-text-1 hover:underline"
                    >
                      {lead.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-text-2">{lead.email}</td>
                  <td className="px-4 py-3 text-text-2">{lead.companySize || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-text-2">{formatDateTime(lead.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {nextCursor && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="mt-4 rounded-md border border-border px-4 py-2 text-sm text-text-2 hover:bg-surface-2 disabled:cursor-default"
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </>
  );
}
