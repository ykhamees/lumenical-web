import "server-only";
import { ALLOWED_ADMIN_EMAIL_DOMAIN } from "./auth-domain";
import { adminAuth } from "./firebase-admin";

export const SESSION_COOKIE_NAME = "__session";
// Firebase's createSessionCookie caps expiresIn at 14 days; 5 is plenty for
// an internal console and keeps a stolen cookie's useful life short.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

/**
 * Verifies a fresh Firebase ID token (thrown if invalid/expired, or if it's
 * not a verified lumenical.com account) and mints a session cookie from it.
 * Unlike `role` (deliberately not checked here — "authenticated but
 * unprovisioned" is a legitimate state the UI shows), a wrong-domain
 * identity has no legitimate path to ever becoming valid, so it's rejected
 * at this layer too, not just in the Python API. This cookie only gates
 * whether `proxy.ts` lets a page request through — it is not what
 * authorizes any data access. Every admin data request still carries its
 * own fresh ID token via `Authorization: Bearer`, which the Python API
 * independently verifies.
 */
export async function mintSessionCookie(idToken: string): Promise<string> {
  const decoded = await adminAuth.verifyIdToken(idToken);
  const domain = decoded.email?.split("@")[1]?.toLowerCase();
  if (!decoded.email_verified || domain !== ALLOWED_ADMIN_EMAIL_DOMAIN) {
    throw new Error("Account is not an authorized lumenical.com identity.");
  }
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
  });
}

/** Optimistic check only — no revocation lookup, no Firestore read. Real
 * authorization happens close to the data, in the Python API. */
export async function verifySessionCookie(cookie: string): Promise<boolean> {
  try {
    await adminAuth.verifySessionCookie(cookie);
    return true;
  } catch {
    return false;
  }
}
