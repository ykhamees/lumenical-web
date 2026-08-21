import { ImageResponse } from "next/og";
import { OgCard, ogContentType, ogSize } from "@/lib/og";
import { platforms } from "@/content/platforms";

export const dynamic = "force-static";
export const alt = "Lumenical platform";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return platforms.map((platform) => ({ slug: platform.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const platform = platforms.find((p) => p.slug === slug);

  return new ImageResponse(
    <OgCard eyebrow="Platforms" title={platform?.name ?? "Platforms"} />,
    { ...size }
  );
}
