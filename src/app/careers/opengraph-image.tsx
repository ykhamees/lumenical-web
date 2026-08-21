import { ImageResponse } from "next/og";
import { OgCard, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const alt = "Careers — Lumenical";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return new ImageResponse(
    <OgCard eyebrow="Careers" title="How we hire." />,
    { ...size }
  );
}
