"use client";

import { useEffect, useState } from "react";
import {
  exportSubscribersCsv,
  listSubscribers,
  unsubscribeSubscriber,
} from "@/lib/admin-newsletter-api";
import { formatDateTime } from "@/lib/admin-format";
import {
  NEWSLETTER_STATUSES,
  type NewsletterStatus,
  type NewsletterSubscriber,
} from "@/lib/admin-types";

const PAGE_SIZE = 25;

export function NewsletterConsole() {
  const [statusFilter, setStatusFilter] = useState<NewsletterStatus | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  async function handleExport() {
    setExporting(true);
    setExportError("");
    try {
      const blob = await exportSubscribersCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "newsletter-subscribers.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Could not export subscribers.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-text-1">Newsletter</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-2">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as NewsletterStatus | "all")}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-1 outline-none focus:border-signal-500"
            >
              <option value="all">All</option>
              {NEWSLETTER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-md border border-border px-4 py-2 text-sm text-text-2 hover:bg-surface-2 disabled:cursor-default"
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      <div aria-live="polite">
        {exportError && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {exportError}
          </p>
        )}
      </div>

      <SubscribersTable
        key={`${statusFilter}-${refreshKey}`}
        statusFilter={statusFilter}
        onUnsubscribed={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

function SubscribersTable({
  statusFilter,
  onUnsubscribed,
}: {
  statusFilter: NewsletterStatus | "all";
  onUnsubscribed: () => void;
}) {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unsubscribingId, setUnsubscribingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // No synchronous setState here on purpose — keyed by statusFilter/
  // refreshKey in the parent, so this instance's useState defaults already
  // cover the reset; all setState calls live in the promise callbacks.
  useEffect(() => {
    let cancelled = false;
    listSubscribers({ status: statusFilter, cursor: null, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setSubscribers(data.items);
        setNextCursor(data.nextCursor);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load subscribers.");
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
      const data = await listSubscribers({
        status: statusFilter,
        cursor: nextCursor,
        limit: PAGE_SIZE,
      });
      setSubscribers((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      setError("Could not load more subscribers.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleUnsubscribe(id: string) {
    setUnsubscribingId(id);
    setError("");
    try {
      await unsubscribeSubscriber(id);
      onUnsubscribed();
    } catch {
      setError("Could not unsubscribe this address.");
      setUnsubscribingId(null);
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
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Email</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Status</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">
                Subscribed
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-text-3">
                  Loading…
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-text-3">
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-1">{subscriber.email}</td>
                  <td className="px-4 py-3 text-text-2 capitalize">{subscriber.status}</td>
                  <td className="px-4 py-3 text-text-2">
                    {formatDateTime(subscriber.subscribedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {subscriber.status === "active" && (
                      <button
                        type="button"
                        onClick={() => handleUnsubscribe(subscriber.id)}
                        disabled={unsubscribingId === subscriber.id}
                        className="text-link underline underline-offset-2 hover:text-text-hover disabled:cursor-default"
                      >
                        {unsubscribingId === subscriber.id ? "Unsubscribing…" : "Unsubscribe"}
                      </button>
                    )}
                  </td>
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
