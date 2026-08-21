import bleach

# Matches what the Tiptap StarterKit + Link extension can actually produce
# in the admin console — not a general-purpose HTML allowlist. Defense in
# depth: the API never trusts that only the sanctioned editor produced this
# HTML, since a client could POST arbitrary markup directly.
ALLOWED_TAGS = [
    "p",
    "br",
    "strong",
    "em",
    "s",
    "code",
    "pre",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
]
ALLOWED_ATTRIBUTES = {"a": ["href", "rel", "target"]}


def sanitize_html(raw: str) -> str:
    return str(bleach.clean(raw, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True))
