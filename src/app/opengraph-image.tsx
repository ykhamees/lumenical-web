import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const dynamic = "force-static";
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0E1A2B",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <span style={{ fontSize: 128, fontWeight: 600, color: "#FAF7F2" }}>
            lumen
          </span>
          <span style={{ fontSize: 128, fontWeight: 400, color: "#6B7C94" }}>
            ical
          </span>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "#C9A658",
              marginLeft: 10,
              marginBottom: 44,
            }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#94A1B5", marginTop: 28 }}>
          {site.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
