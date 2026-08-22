import { ImageResponse } from "next/og";
import { OgCard, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const alt = "Lumenical demos";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return new ImageResponse(<OgCard eyebrow="Demos" title="What we've built" />, { ...size });
}
