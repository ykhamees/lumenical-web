"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AdminApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth";
import { DEMO_KINDS, type Demo, type DemoKind } from "@/lib/cms-types";
import { slugify } from "@/lib/format";
import {
  createDemo,
  deleteDemo,
  getDemo,
  publishDemo,
  unpublishDemo,
  updateDemo,
  type DemoInput,
} from "@/lib/demos-api";
import { RichTextEditor } from "./RichTextEditor";
import { SanitizedHtml } from "./SanitizedHtml";

export function DemoEditor({
  id,
  onClose,
  onCreated,
}: {
  /** null = creating a new demo. */
  id: string | null;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const { role } = useAdminAuth();
  const isNew = id === null;

  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState(false);

  const [demo, setDemo] = useState<Demo | null>(null);

  const [slugValue, setSlugValue] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<DemoKind>("product");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [order, setOrder] = useState(0);

  // No synchronous setState here on purpose — the parent keys this
  // component by the "demo" query param, so switching items (or from
  // "new" to a real id post-create) mounts a fresh instance whose
  // useState defaults already cover the reset.
  useEffect(() => {
    if (isNew || !id) return;
    let cancelled = false;
    getDemo(id)
      .then((data) => {
        if (cancelled) return;
        setDemo(data);
        setSlugValue(data.slug);
        setSlugTouched(true);
        setTitle(data.title);
        setKind(data.kind);
        setSummary(data.summary);
        setBody(data.body);
        setMediaUrl(data.mediaUrl ?? "");
        setSeoTitle(data.seo.title ?? "");
        setSeoDescription(data.seo.description ?? "");
        setOrder(data.order);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this demo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlugValue(slugify(value));
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const input: DemoInput = {
      slug: slugValue,
      title,
      kind,
      summary,
      body,
      mediaUrl: mediaUrl.trim() || null,
      seo: { title: seoTitle || null, description: seoDescription || null },
      order,
    };
    try {
      if (isNew) {
        const created = await createDemo(input);
        onCreated(created.id);
      } else if (id) {
        const updated = await updateDemo(id, input);
        setDemo(updated);
      }
    } catch (err) {
      setError(
        err instanceof AdminApiError && err.status === 409
          ? "That slug is already in use."
          : "Could not save this demo."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishToggle() {
    if (!demo) return;
    setPublishing(true);
    setError("");
    try {
      const updated =
        demo.status === "published" ? await unpublishDemo(demo.id) : await publishDemo(demo.id);
      setDemo(updated);
    } catch {
      setError("Could not update publish status.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!demo) return;
    setDeleting(true);
    setError("");
    try {
      await deleteDemo(demo.id);
      onClose();
    } catch {
      setError("Could not delete this demo.");
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-3">Loading…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-link underline underline-offset-2 hover:text-text-hover"
        >
          ← Back to demos
        </button>
        {demo && (
          <span
            className={`rounded-full border px-2 py-0.5 text-xs capitalize ${
              demo.status === "published"
                ? "border-success-500/40 bg-success-500/[0.06] text-text-1"
                : "border-border text-text-2"
            }`}
          >
            {demo.status}
          </span>
        )}
      </div>

      <div aria-live="polite">
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-5">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Slug">
            <input
              value={slugValue}
              onChange={(e) => {
                setSlugTouched(true);
                setSlugValue(slugify(e.target.value));
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Summary">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </Field>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
              Body
            </span>
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              className="text-sm text-link underline underline-offset-2 hover:text-text-hover"
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div className="rounded-md border border-border bg-surface px-3 py-3">
              <SanitizedHtml html={body} />
            </div>
          ) : (
            <RichTextEditor value={body} onChange={setBody} />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Field label="Kind">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as DemoKind)}
              className={inputClass}
            >
              {DEMO_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Media URL">
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </Field>
          <Field label="SEO title">
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="SEO description">
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>
          <Field label="Order">
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !title.trim() || !slugValue.trim()}
          className="rounded-md bg-cta px-6 py-3 text-sm font-medium text-on-cta hover:bg-cta-hover disabled:cursor-default disabled:opacity-60"
        >
          {saving ? "Saving…" : isNew ? "Create demo" : "Save changes"}
        </button>

        {demo && (
          <button
            type="button"
            onClick={handlePublishToggle}
            disabled={publishing}
            className="rounded-md border border-border px-4 py-2 text-sm text-text-2 hover:bg-surface-2 disabled:cursor-default"
          >
            {publishing ? "Working…" : demo.status === "published" ? "Unpublish" : "Publish"}
          </button>
        )}

        {demo &&
          role === "admin" &&
          (confirmingDelete ? (
            <span className="flex items-center gap-2 text-sm">
              <span className="text-text-2">Delete this demo?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 underline underline-offset-2"
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-text-2 underline underline-offset-2"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-sm text-red-600 underline underline-offset-2"
            >
              Delete
            </button>
          ))}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[15px] text-text-1 outline-none transition-colors focus:border-signal-500 focus:shadow-[0_0_0_3px_theme(colors.signal.100)]";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
        {label}
      </span>
      {children}
    </label>
  );
}
