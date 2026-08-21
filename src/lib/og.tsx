// Shared generator for every route's opengraph-image.tsx. Satori (the
// next/og renderer) can't read Tailwind, so these are the one place raw
// hex literals are allowed outside tailwind.config.ts.
export const ogColors = {
  bg: "#0E1A2B",
  paper: "#FAF7F2",
  muted: "#6B7C94",
  gold: "#C9A658",
  faint: "#94A1B5",
} as const;

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function OgCard({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ogColors.bg,
        fontFamily: "sans-serif",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          marginBottom: eyebrow ? 40 : 56,
        }}
      >
        <span style={{ fontSize: 40, fontWeight: 600, color: ogColors.paper }}>
          lumen
        </span>
        <span style={{ fontSize: 40, fontWeight: 400, color: ogColors.muted }}>
          ical
        </span>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: ogColors.gold,
            marginLeft: 6,
            marginBottom: 14,
          }}
        />
      </div>
      {eyebrow && (
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: ogColors.faint,
            marginBottom: 20,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          display: "flex",
          fontSize: title.length > 40 ? 44 : 56,
          fontWeight: 500,
          color: ogColors.paper,
          textAlign: "center",
          maxWidth: 960,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
    </div>
  );
}
