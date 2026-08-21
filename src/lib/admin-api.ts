import { auth } from "./firebase-client";

export class AdminApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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
    throw new AdminApiError(res.status, body.detail ?? `Request failed (${res.status})`);
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
