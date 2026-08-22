import type { LeadStatus } from "@/lib/types";

// Same low-opacity-tint-over-semantic-text convention as ContactForm's
// success message (border-success-500/40 bg-success-500/[0.06] text-text-1)
// — a subtle accent that stays legible in both themes, never the only
// signal (the status label text is always shown too).
const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "border-border text-text-2",
  contacted: "border-signal-500/40 bg-signal-500/[0.06] text-text-1",
  qualified: "border-lumen-500/40 bg-lumen-500/[0.06] text-text-1",
  won: "border-success-500/40 bg-success-500/[0.06] text-text-1",
  lost: "border-red-600/40 bg-red-600/[0.06] text-text-1",
};

export function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}
