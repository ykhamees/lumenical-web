import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { OgCard, ogContentType, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const alt = `${site.name} — ${site.tagline}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return new ImageResponse(<OgCard title={site.tagline} />, { ...size });
}
