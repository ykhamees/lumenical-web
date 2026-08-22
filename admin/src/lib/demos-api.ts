import { adminFetch, adminFetchJson } from "./api";
import type { ContentStatus, Demo, DemoKind, DemoListResponse, SeoFields } from "./cms-types";

export async function listDemos(options: {
  status: ContentStatus | "all";
  cursor: string | null;
  limit: number;
}): Promise<DemoListResponse> {
  const params = new URLSearchParams({ limit: String(options.limit) });
  if (options.status !== "all") params.set("status", options.status);
  if (options.cursor) params.set("cursor", options.cursor);
  return adminFetchJson<DemoListResponse>(`/api/demos?${params}`);
}

export async function getDemo(id: string): Promise<Demo> {
  return adminFetchJson<Demo>(`/api/demos/${id}`);
}

export type DemoInput = {
  slug: string;
  title: string;
  kind: DemoKind;
  summary: string;
  body: string;
  mediaUrl: string | null;
  seo: SeoFields;
  order: number;
};

export async function createDemo(input: DemoInput): Promise<Demo> {
  return adminFetchJson<Demo>("/api/demos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateDemo(id: string, input: DemoInput): Promise<Demo> {
  return adminFetchJson<Demo>(`/api/demos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function publishDemo(id: string): Promise<Demo> {
  return adminFetchJson<Demo>(`/api/demos/${id}/publish`, { method: "POST" });
}

export async function unpublishDemo(id: string): Promise<Demo> {
  return adminFetchJson<Demo>(`/api/demos/${id}/unpublish`, { method: "POST" });
}

export async function deleteDemo(id: string): Promise<void> {
  await adminFetch(`/api/demos/${id}`, { method: "DELETE" });
}
