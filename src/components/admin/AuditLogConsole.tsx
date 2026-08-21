"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/admin-format";
import { listAuditLog, type AuditLogEntry } from "@/lib/admin-logs-api";

const PAGE_SIZE = 25;
const TARGET_COLLECTIONS = ["leads", "newsletterSubscribers", "pages", "demos", "media"];

function summarizeChange(entry: AuditLogEntry): string {
  if ("status" in entry.before && "status" in entry.after) {
    return `${String(entry.before.status)} → ${String(entry.after.status)}`;
  }
  const parts = Object.entries(entry.before).map(([k, v]) => `${k}: ${String(v)}`);
  return parts.join(", ") || "—";
}

export function AuditLogConsole() {
  const [targetCollection, setTargetCollection] = useState<string>("all");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-text-1">Audit log</h1>
        <label className="flex items-center gap-2 text-sm text-text-2">
          Collection
          <select
            value={targetCollection}
            onChange={(e) => setTargetCollection(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-1 outline-none focus:border-signal-500"
          >
            <option value="all">All</option>
            {TARGET_COLLECTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Keyed by targetCollection: switching filters mounts a fresh
          table with its own fresh loading/error/entries state, rather
          than resetting that state imperatively in an effect. */}
      <AuditLogTable key={targetCollection} targetCollection={targetCollection} />
    </div>
  );
}

function AuditLogTable({ targetCollection }: { targetCollection: string }) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // No synchronous setState here on purpose — this component is keyed by
  // targetCollection (see AuditLogConsole), so a filter change mounts a
  // fresh instance whose useState defaults already cover the reset. All
  // setState calls below live inside the .then/.catch/.finally callbacks.
  useEffect(() => {
    let cancelled = false;
    listAuditLog({ targetCollection, cursor: null, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setEntries(data.items);
        setNextCursor(data.nextCursor);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the audit log.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetCollection]);

  async function handleLoadMore() {
    setLoadingMore(true);
    setError("");
    try {
      const data = await listAuditLog({ targetCollection, cursor: nextCursor, limit: PAGE_SIZE });
      setEntries((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      setError("Could not load more entries.");
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
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Action</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Target</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Change</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Actor</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">When</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-3">
                  Loading…
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-3">
                  No audit entries yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-1">{entry.action}</td>
                  <td className="px-4 py-3 text-text-2">
                    {entry.targetCollection}/{entry.targetId}
                  </td>
                  <td className="px-4 py-3 text-text-2">{summarizeChange(entry)}</td>
                  <td className="px-4 py-3 text-text-2">{entry.actorEmail ?? entry.actorUid}</td>
                  <td className="px-4 py-3 text-text-2">{formatDateTime(entry.createdAt)}</td>
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
