"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ContentStatus, Demo } from "@/lib/cms-types";
import { formatDateTime } from "@/lib/format";
import { listDemos } from "@/lib/demos-api";
import { DemoEditor } from "./DemoEditor";

const PAGE_SIZE = 25;

export function DemosConsole() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const demoParam = searchParams.get("demo");

  function openEditor(idOrNew: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("demo", idOrNew);
    router.push(`${pathname}?${params}`);
  }

  function closeEditor() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("demo");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  if (demoParam) {
    return (
      <DemoEditor
        key={demoParam}
        id={demoParam === "new" ? null : demoParam}
        onClose={closeEditor}
        onCreated={openEditor}
      />
    );
  }

  return <DemosList onOpen={openEditor} />;
}

function DemosList({ onOpen }: { onOpen: (idOrNew: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-text-1">Demos</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-2">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ContentStatus | "all")}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-1 outline-none focus:border-signal-500"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => onOpen("new")}
            className="rounded-md bg-cta px-4 py-2 text-sm font-medium text-on-cta hover:bg-cta-hover"
          >
            New demo
          </button>
        </div>
      </div>

      <DemosTable key={statusFilter} statusFilter={statusFilter} onOpen={onOpen} />
    </div>
  );
}

function DemosTable({
  statusFilter,
  onOpen,
}: {
  statusFilter: ContentStatus | "all";
  onOpen: (id: string) => void;
}) {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    listDemos({ status: statusFilter, cursor: null, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setDemos(data.items);
        setNextCursor(data.nextCursor);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load demos.");
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
      const data = await listDemos({ status: statusFilter, cursor: nextCursor, limit: PAGE_SIZE });
      setDemos((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      setError("Could not load more demos.");
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
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Title</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Slug</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Kind</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Status</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-3">
                  Loading…
                </td>
              </tr>
            ) : demos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-3">
                  No demos yet.
                </td>
              </tr>
            ) : (
              demos.map((demo) => (
                <tr key={demo.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpen(demo.id)}
                      className="text-left text-text-1 hover:underline"
                    >
                      {demo.title}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-text-2">{demo.slug}</td>
                  <td className="px-4 py-3 capitalize text-text-2">{demo.kind}</td>
                  <td className="px-4 py-3 capitalize text-text-2">{demo.status}</td>
                  <td className="px-4 py-3 text-text-2">{formatDateTime(demo.updatedAt)}</td>
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
