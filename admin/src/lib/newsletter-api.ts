import { adminFetch, adminFetchJson } from "./api";
import type { NewsletterListResponse, NewsletterStatus, NewsletterSubscriber } from "./types";

export async function listSubscribers(options: {
  status: NewsletterStatus | "all";
  cursor: string | null;
  limit: number;
}): Promise<NewsletterListResponse> {
  const params = new URLSearchParams({ limit: String(options.limit) });
  if (options.status !== "all") params.set("status", options.status);
  if (options.cursor) params.set("cursor", options.cursor);
  return adminFetchJson<NewsletterListResponse>(`/api/newsletter?${params}`);
}

export async function unsubscribeSubscriber(id: string): Promise<NewsletterSubscriber> {
  return adminFetchJson<NewsletterSubscriber>(`/api/newsletter/${id}/unsubscribe`, {
    method: "POST",
  });
}

export async function exportSubscribersCsv(): Promise<Blob> {
  const res = await adminFetch("/api/newsletter/export");
  return res.blob();
}
