"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { RICH_TEXT_CONTENT_CLASS } from "@/lib/rich-text-style";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit already bundles the Link extension (as of Tiptap v3) —
      // registering @tiptap/extension-link separately caused a duplicate
      // extension warning; configure it through StarterKit instead.
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: `${RICH_TEXT_CONTENT_CLASS} min-h-[240px] rounded-md border border-border bg-surface px-3 py-2 outline-none focus:border-signal-500`,
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const buttons: Array<{ label: string; onClick: () => void; active: boolean }> = [
    {
      label: "Bold",
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "Italic",
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "H2",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "H3",
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      label: "List",
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "1. List",
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "Quote",
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "Code",
      onClick: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
    },
  ];

  function openLinkInput() {
    const current = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(current ?? "");
    setLinkInputOpen(true);
  }

  function applyLink() {
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
    }
    setLinkInputOpen(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface-2 p-1">
        {buttons.map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.onClick}
            className={`rounded px-2 py-1 text-xs font-medium ${
              b.active ? "bg-cta text-on-cta" : "text-text-2 hover:bg-surface"
            }`}
          >
            {b.label}
          </button>
        ))}
        <button
          type="button"
          onClick={openLinkInput}
          className={`rounded px-2 py-1 text-xs font-medium ${
            editor.isActive("link") ? "bg-cta text-on-cta" : "text-text-2 hover:bg-surface"
          }`}
        >
          Link
        </button>
      </div>

      {linkInputOpen && (
        <div className="flex gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
            className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-sm text-text-1 outline-none focus:border-signal-500"
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded-md bg-cta px-3 py-1 text-xs font-medium text-on-cta hover:bg-cta-hover"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setLinkInputOpen(false)}
            className="rounded-md border border-border px-3 py-1 text-xs text-text-2 hover:bg-surface-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
