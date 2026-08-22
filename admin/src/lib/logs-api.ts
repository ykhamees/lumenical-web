import { adminFetchJson } from "./api";

export type AuditLogEntry = {
  id: string;
  action: string;
  targetCollection: string;
  targetId: string;
  actorUid: string;
  actorEmail: string | null;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  createdAt: string | null;
};

export type AuditLogListResponse = {
  items: AuditLogEntry[];
  nextCursor: string | null;
};

export async function listAuditLog(options: {
  targetCollection: string | "all";
  cursor: string | null;
  limit: number;
}): Promise<AuditLogListResponse> {
  const params = new URLSearchParams({ limit: String(options.limit) });
  if (options.targetCollection !== "all") {
    params.set("targetCollection", options.targetCollection);
  }
  if (options.cursor) params.set("cursor", options.cursor);
  return adminFetchJson<AuditLogListResponse>(`/api/audit-log?${params}`);
}

export type OutboundEmailEntry = {
  id: string;
  to: string;
  subject: string;
  provider: string;
  status: string;
  error: string | null;
  relatedLeadId: string | null;
  sentAt: string | null;
};

export type OutboundEmailListResponse = {
  items: OutboundEmailEntry[];
  nextCursor: string | null;
};

export async function listOutboundEmails(options: {
  status: string | "all";
  cursor: string | null;
  limit: number;
}): Promise<OutboundEmailListResponse> {
  const params = new URLSearchParams({ limit: String(options.limit) });
  if (options.status !== "all") params.set("status", options.status);
  if (options.cursor) params.set("cursor", options.cursor);
  return adminFetchJson<OutboundEmailListResponse>(`/api/outbound-emails?${params}`);
}
