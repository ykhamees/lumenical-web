import { auth } from "./firebase-client";

export class AdminApiError extends Error {
  status: number;
  /** The raw `detail` field from the API's error body — a string for most
   * endpoints, but a structured object for endpoints like media delete
   * that need to hand back more than a message (e.g. referencedBy). */
  detail: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Fetches a fresh (auto-refreshed by the SDK if near expiry) ID token on
 * every call rather than reusing one cached in React state — an expired
 * token never gets handed to the API mid-session.
 */
export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new AdminApiError(401, "Not signed in");
  }

  const token = await user.getIdToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.detail === "string" ? body.detail : `Request failed (${res.status})`;
    throw new AdminApiError(res.status, message, body.detail);
  }

  return res;
}

export async function adminFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  return res.json() as Promise<T>;
}
