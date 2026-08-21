import { ImageResponse } from "next/og";
import { OgCard, ogContentType, ogSize } from "@/lib/og";
import { services } from "@/content/services";

export const dynamic = "force-static";
export const alt = "Lumenical service";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);

  return new ImageResponse(
    <OgCard eyebrow="Services" title={service?.name ?? "Services"} />,
    { ...size }
  );
}
