"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { addLeadNote, getLead, updateLeadStatus } from "@/lib/leads-api";
import { formatDateTime } from "@/lib/format";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/types";

export function LeadDrawer({
  leadId,
  onClose,
  onStatusChanged,
}: {
  leadId: string;
  onClose: () => void;
  onStatusChanged: (id: string, status: LeadStatus) => void;
}) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // No synchronous setState here on purpose — the parent keys this
  // component by leadId, so switching leads mounts a fresh instance whose
  // useState defaults (loading=true, error="", lead=null) already cover
  // the reset; this effect only needs to kick off the fetch.
  useEffect(() => {
    let cancelled = false;
    getLead(leadId)
      .then((data) => {
        if (!cancelled) setLead(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this lead.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  // Same focus-trap/scroll-lock/Escape pattern as Header.tsx's mobile menu.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea, select, input"
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  async function handleStatusChange(status: LeadStatus) {
    setStatusSaving(true);
    setError("");
    try {
      const updated = await updateLeadStatus(leadId, status);
      setLead(updated);
      onStatusChanged(leadId, status);
    } catch {
      setError("Could not update status.");
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteSaving(true);
    setError("");
    try {
      const updated = await addLeadNote(leadId, noteText.trim());
      setLead(updated);
      setNoteText("");
    } catch {
      setError("Could not add note.");
    } finally {
      setNoteSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/40" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Lead details"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-bg p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-text-1">Lead details</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="text-sm text-text-2 hover:text-text-hover"
          >
            Close
          </button>
        </div>

        {loading && <p className="mt-6 text-sm text-text-3">Loading…</p>}
        <div aria-live="polite">
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {lead && !loading && (
          <div className="mt-6 flex flex-col gap-6">
            <div>
              <p className="text-lg text-text-1">{lead.name}</p>
              <p className="text-sm text-text-2">{lead.email}</p>
              <p className="mt-1 text-xs text-text-3">{formatDateTime(lead.createdAt)}</p>
            </div>

            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
                Company size
              </span>
              <p className="mt-1 text-sm text-text-1">{lead.companySize || "—"}</p>
            </div>

            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
                Message
              </span>
              <p className="mt-1 whitespace-pre-wrap text-sm text-text-1">{lead.message}</p>
            </div>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
                Status
              </span>
              <select
                value={lead.status}
                disabled={statusSaving}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="w-fit rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-1 outline-none focus:border-signal-500"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-label">
                Notes
              </span>
              <ul className="mt-2 flex flex-col gap-3">
                {lead.notes.length === 0 && <li className="text-sm text-text-3">No notes yet.</li>}
                {lead.notes.map((note, i) => (
                  <li
                    key={`${note.createdAt}-${i}`}
                    className="rounded-md border border-border bg-surface p-3 text-sm"
                  >
                    <p className="text-text-1">{note.text}</p>
                    <p className="mt-1 text-xs text-text-3">
                      {note.authorEmail ?? note.authorUid} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>

              <form onSubmit={handleAddNote} className="mt-3 flex flex-col gap-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="Add a note…"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-1 outline-none focus:border-signal-500"
                />
                <button
                  type="submit"
                  disabled={noteSaving || !noteText.trim()}
                  className="w-fit rounded-md bg-cta px-4 py-2 text-sm font-medium text-on-cta hover:bg-cta-hover disabled:cursor-default disabled:opacity-60"
                >
                  {noteSaving ? "Saving…" : "Add note"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
