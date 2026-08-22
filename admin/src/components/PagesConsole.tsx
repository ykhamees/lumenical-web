"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ContentStatus, Page } from "@/lib/cms-types";
import { formatDateTime } from "@/lib/format";
import { listPages } from "@/lib/pages-api";
import { PageEditor } from "./PageEditor";

const PAGE_SIZE = 25;

export function PagesConsole() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");

  function openEditor(slugOrNew: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", slugOrNew);
    router.push(`${pathname}?${params}`);
  }

  function closeEditor() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  if (pageParam) {
    return (
      <PageEditor
        key={pageParam}
        slug={pageParam === "new" ? null : pageParam}
        onClose={closeEditor}
        onCreated={openEditor}
      />
    );
  }

  return <PagesList onOpen={openEditor} />;
}

function PagesList({ onOpen }: { onOpen: (slugOrNew: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-text-1">Pages</h1>
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
            New page
          </button>
        </div>
      </div>

      <PagesTable key={statusFilter} statusFilter={statusFilter} onOpen={onOpen} />
    </div>
  );
}

function PagesTable({
  statusFilter,
  onOpen,
}: {
  statusFilter: ContentStatus | "all";
  onOpen: (slug: string) => void;
}) {
  const [pages, setPages] = useState<Page[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    listPages({ status: statusFilter, cursor: null, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setPages(data.items);
        setNextCursor(data.nextCursor);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load pages.");
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
      const data = await listPages({ status: statusFilter, cursor: nextCursor, limit: PAGE_SIZE });
      setPages((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      setError("Could not load more pages.");
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
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Status</th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em]">Order</th>
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
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-3">
                  No pages yet.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.slug} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpen(page.slug)}
                      className="text-left text-text-1 hover:underline"
                    >
                      {page.title}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-text-2">{page.slug}</td>
                  <td className="px-4 py-3 capitalize text-text-2">{page.status}</td>
                  <td className="px-4 py-3 text-text-2">{page.order}</td>
                  <td className="px-4 py-3 text-text-2">{formatDateTime(page.updatedAt)}</td>
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
