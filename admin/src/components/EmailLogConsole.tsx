"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";
import { listOutboundEmails, type OutboundEmailEntry } from "@/lib/logs-api";

const PAGE_SIZE = 25;
const STATUSES = ["sent", "skipped", "failed"];

const STATUS_STYLES: Record<string, string> = {
  sent: "border-success-500/40 bg-success-500/[0.06] text-text-1",
  skipped: "border-border text-text-2",
  failed: "border-red-600/40 bg-red-600/[0.06] text-text-1",
};

export function EmailLogConsole() {
  const [status, setStatus] = useState<string>("all");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-text-1">Outbound email</h1>
        <label className="flex items-center gap-2 text-sm text-text-2">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-1 outline-none focus:border-signal-500"
          >
            <option value="all">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Keyed by status: switching filters mounts a fresh table with its
          own fresh loading/error/entries state, rather than resetting
          that state imperatively in an effect. */}
      <EmailLogTable key={status} status={status} />
    </div>
  );
}

function EmailLogTable({ status }: { status: string }) {
  const [entries, setEntries] = useState<OutboundEmailEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // No synchronous setState here on purpose — this component is keyed by
  // status (see EmailLogConsole), so a filter change mounts a fresh
  // instance whose useState defaults already cover the reset. All
  // setState calls below live inside the .then/.catch/.finally callbacks.
  useEffect(() => {
    let cancelled = false;
    listOutboundEmails({ status, cursor: null, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setEntries(data.items);
        setNextCursor(data.nextCursor);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the email log.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  async function handleLoadMore() {
    setLoadingMore(true);
    setError("");
    try {
      const data = await listOutboundEmails({ status, cursor: nextCursor, limit: PAGE_SIZE });
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
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">To</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Subject</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Status</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Sent</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-text-3">
                  Loading…
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-text-3">
                  No emails yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-1">{entry.to}</td>
                  <td className="px-4 py-3 text-text-2">{entry.subject}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs capitalize ${
                        STATUS_STYLES[entry.status] ?? "border-border text-text-2"
                      }`}
                      title={entry.error ?? undefined}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-2">{formatDateTime(entry.sentAt)}</td>
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
