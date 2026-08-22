import { ImageResponse } from "next/og";
import { OgCard, ogContentType, ogSize } from "@/lib/og";
import { getPublishedDemoBySlug, getPublishedDemos, toSlugParams } from "@/lib/cms";

export const dynamic = "force-static";
export const alt = "Lumenical demo";
export const size = ogSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  return toSlugParams(await getPublishedDemos());
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = await getPublishedDemoBySlug(slug);

  return new ImageResponse(<OgCard eyebrow="Demos" title={demo?.title ?? "Demos"} />, {
    ...size,
  });
}
