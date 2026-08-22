import { adminFetch, adminFetchJson } from "./api";
import type { ContentStatus, Page, PageListResponse, SeoFields } from "./cms-types";

export async function listPages(options: {
  status: ContentStatus | "all";
  cursor: string | null;
  limit: number;
}): Promise<PageListResponse> {
  const params = new URLSearchParams({ limit: String(options.limit) });
  if (options.status !== "all") params.set("status", options.status);
  if (options.cursor) params.set("cursor", options.cursor);
  return adminFetchJson<PageListResponse>(`/api/admin/pages?${params}`);
}

export async function getPage(slug: string): Promise<Page> {
  return adminFetchJson<Page>(`/api/admin/pages/${slug}`);
}

export type PageInput = {
  title: string;
  excerpt: string;
  body: string;
  seo: SeoFields;
  order: number;
  tags: string[];
};

export async function createPage(slug: string, input: PageInput): Promise<Page> {
  return adminFetchJson<Page>("/api/admin/pages", {
    method: "POST",
    body: JSON.stringify({ slug, ...input }),
  });
}

export async function updatePage(slug: string, input: PageInput): Promise<Page> {
  return adminFetchJson<Page>(`/api/admin/pages/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function publishPage(slug: string): Promise<Page> {
  return adminFetchJson<Page>(`/api/admin/pages/${slug}/publish`, { method: "POST" });
}

export async function unpublishPage(slug: string): Promise<Page> {
  return adminFetchJson<Page>(`/api/admin/pages/${slug}/unpublish`, { method: "POST" });
}

export async function deletePage(slug: string): Promise<void> {
  await adminFetch(`/api/admin/pages/${slug}`, { method: "DELETE" });
}
