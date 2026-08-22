import { adminFetchJson } from "./api";

export type DeployStatus = {
  configured: boolean;
  status: "queued" | "in_progress" | "completed" | "error" | null;
  conclusion: "success" | "failure" | "cancelled" | "skipped" | "timed_out" | null;
  htmlUrl: string | null;
  updatedAt: string | null;
};

export async function getDeployStatus(): Promise<DeployStatus> {
  return adminFetchJson<DeployStatus>("/api/admin/deploy-status");
}
