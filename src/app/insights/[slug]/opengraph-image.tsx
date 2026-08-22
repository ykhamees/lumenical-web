import { ImageResponse } from "next/og";
import { OgCard, ogContentType, ogSize } from "@/lib/og";
import { getPublishedPageBySlug, getPublishedPages, toSlugParams } from "@/lib/cms";

export const dynamic = "force-static";
export const alt = "Lumenical insight";
export const size = ogSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  return toSlugParams(await getPublishedPages());
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);

  return new ImageResponse(<OgCard eyebrow="Insights" title={page?.title ?? "Insights"} />, {
    ...size,
  });
}
