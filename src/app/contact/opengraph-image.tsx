import { ImageResponse } from "next/og";
import { OgCard, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const alt = "Contact — Lumenical";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return new ImageResponse(
    <OgCard eyebrow="Contact" title="Let's talk." />,
    { ...size }
  );
}
