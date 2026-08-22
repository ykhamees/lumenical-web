import { adminFetchJson } from "./api";
import type { Lead, LeadListResponse, LeadStatus } from "./types";

export async function listLeads(options: {
  status: LeadStatus | "all";
  cursor: string | null;
  limit: number;
}): Promise<LeadListResponse> {
  const params = new URLSearchParams({ limit: String(options.limit) });
  if (options.status !== "all") params.set("status", options.status);
  if (options.cursor) params.set("cursor", options.cursor);
  return adminFetchJson<LeadListResponse>(`/api/leads?${params}`);
}

export async function getLead(id: string): Promise<Lead> {
  return adminFetchJson<Lead>(`/api/leads/${id}`);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  return adminFetchJson<Lead>(`/api/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function addLeadNote(id: string, text: string): Promise<Lead> {
  return adminFetchJson<Lead>(`/api/leads/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
