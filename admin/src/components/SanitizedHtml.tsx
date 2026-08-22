import DOMPurify from "isomorphic-dompurify";
import { RICH_TEXT_CONTENT_CLASS } from "@/lib/rich-text-style";

// Defense in depth: the API already sanitizes on write, but this re-checks
// at render time too — the standard practice for any dangerouslySetInnerHTML,
// regardless of how much the data source is already trusted.
export function SanitizedHtml({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html);
  return <div className={RICH_TEXT_CONTENT_CLASS} dangerouslySetInnerHTML={{ __html: clean }} />;
}
