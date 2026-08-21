"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { AdminApiError } from "@/lib/admin-api";
import { formatDateTime, formatFileSize } from "@/lib/admin-format";
import { deleteMedia, listMedia, uploadFile, type MediaAsset } from "@/lib/admin-media-api";

const PAGE_SIZE = 24;

type ReferencedBy = { id: string; title: string };

export function MediaConsole() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [referencedBy, setReferencedBy] = useState<ReferencedBy[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // No synchronous setState here on purpose — listMedia is imported from a
  // different module, and every setState below lives inside the
  // .then/.catch/.finally callbacks, not the effect body itself.
  useEffect(() => {
    let cancelled = false;
    listMedia({ cursor: null, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setAssets(data.items);
        setNextCursor(data.nextCursor);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load media.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleLoadMore() {
    setLoadingMore(true);
    setError("");
    try {
      const data = await listMedia({ cursor: nextCursor, limit: PAGE_SIZE });
      setAssets((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      setError("Could not load more media.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadFile(file, isPublic);
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Could not upload this file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string, force = false) {
    setDeletingId(id);
    setError("");
    try {
      await deleteMedia(id, { force });
      setConfirmingDeleteId(null);
      setReferencedBy([]);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 409) {
        const detail = err.detail as { referencedBy?: ReferencedBy[] } | undefined;
        setReferencedBy(detail?.referencedBy ?? []);
        setConfirmingDeleteId(id);
      } else {
        setError("Could not delete this asset.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-text-1">Media</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Public
          </label>
          <label className="rounded-md bg-cta px-4 py-2 text-sm font-medium text-on-cta hover:bg-cta-hover cursor-pointer">
            {uploading ? "Uploading…" : "Upload"}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div aria-live="polite">
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-text-3">Loading…</p>
      ) : assets.length === 0 ? (
        <p className="mt-6 text-sm text-text-3">No media yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface"
            >
              <div className="flex h-32 items-center justify-center bg-surface-2">
                {asset.contentType.startsWith("image/") && asset.url ? (
                  // Arbitrary external GCS URLs in an admin-only tool;
                  // images.unoptimized is already true globally for the
                  // static export, so next/image's optimization pipeline
                  // (and its remotePatterns allowlist) buys nothing here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-mono text-xs uppercase text-text-3">
                    {asset.contentType.split("/")[1] ?? "file"}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="truncate text-sm text-text-1" title={asset.filename}>
                  {asset.filename}
                </p>
                <p className="text-xs text-text-3">
                  {formatFileSize(asset.size)} · {asset.public ? "Public" : "Private"}
                </p>
                <p className="text-xs text-text-3">{formatDateTime(asset.createdAt)}</p>

                {confirmingDeleteId === asset.id ? (
                  <div className="mt-2 flex flex-col gap-2 rounded-md border border-red-600/40 bg-red-600/[0.06] p-2 text-xs">
                    <p className="text-text-1">
                      {referencedBy.length > 0
                        ? `Used by: ${referencedBy.map((r) => r.title).join(", ")}`
                        : "Delete this asset?"}
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(asset.id, true)}
                        disabled={deletingId === asset.id}
                        className="text-red-600 underline underline-offset-2"
                      >
                        {deletingId === asset.id ? "Deleting…" : "Delete anyway"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingDeleteId(null);
                          setReferencedBy([]);
                        }}
                        className="text-text-2 underline underline-offset-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    className="mt-2 w-fit text-xs text-red-600 underline underline-offset-2"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
