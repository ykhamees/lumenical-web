export type ContentStatus = "draft" | "published";

export type SeoFields = {
  title: string | null;
  description: string | null;
};

export const EMPTY_SEO: SeoFields = { title: null, description: null };

export type Page = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  seo: SeoFields;
  order: number;
  tags: string[];
  status: ContentStatus;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
};

export type PageListResponse = {
  items: Page[];
  nextCursor: string | null;
};

export type DemoKind = "product" | "case-study";

export const DEMO_KINDS: DemoKind[] = ["product", "case-study"];

export type Demo = {
  id: string;
  slug: string;
  title: string;
  kind: DemoKind;
  summary: string;
  body: string;
  mediaUrl: string | null;
  seo: SeoFields;
  order: number;
  status: ContentStatus;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
};

export type DemoListResponse = {
  items: Demo[];
  nextCursor: string | null;
};
