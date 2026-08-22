// Shared between the admin console's rich-text editor and this app's public
// rendering of the same CMS body HTML, so authoring preview and the live
// page render identically. Duplicated from admin/src/lib/rich-text-style.ts
// deliberately — the two apps are independent, see CLAUDE.md. No Tailwind
// Typography plugin installed — targets the handful of tags Tiptap's
// StarterKit + Link extension actually produce, using only this repo's
// existing DS tokens (never a raw color).
export const RICH_TEXT_CONTENT_CLASS =
  "flex flex-col gap-3 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-text-1 " +
  "[&_h3]:font-serif [&_h3]:text-lg [&_h3]:text-text-1 " +
  "[&_h4]:font-serif [&_h4]:text-base [&_h4]:text-text-1 " +
  "[&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-text-2 " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-sm [&_li]:text-text-2 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-border-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-2 " +
  "[&_a]:text-link [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_code]:text-text-1 " +
  "[&_strong]:font-semibold [&_strong]:text-text-1";
