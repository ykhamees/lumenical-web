"use client";

// global-error replaces the root layout entirely when it renders, so it
// can't rely on globals.css/Tailwind having loaded — hence inline styles
// and literal colors here, unlike the rest of the app.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf7f2",
          color: "#0e1a2b",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>
            Something went wrong.
          </h1>
          <p style={{ fontSize: 15, color: "#324562", margin: 0 }}>
            Please try again, or reload the page.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              alignSelf: "center",
              borderRadius: 6,
              backgroundColor: "#0e1a2b",
              color: "#faf7f2",
              fontSize: 14,
              fontWeight: 500,
              padding: "12px 24px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
