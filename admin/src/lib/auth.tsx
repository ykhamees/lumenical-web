"use client";

import {
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ALLOWED_ADMIN_EMAIL_DOMAIN } from "./auth-domain";
import { BASE_PATH } from "./base-path";
import { auth } from "./firebase-client";

type Role = "admin" | "editor" | null;
type Status = "loading" | "signed-out" | "signed-in";

type AdminAuthContextValue = {
  status: Status;
  user: User | null;
  role: Role;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function isAllowedAccount(user: User): boolean {
  const domain = user.email?.split("@")[1]?.toLowerCase();
  return user.emailVerified && domain === ALLOWED_ADMIN_EMAIL_DOMAIN;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // onIdTokenChanged (not onAuthStateChanged) also fires on the SDK's
    // silent background token refresh, so `role` never goes stale — a
    // forged/expired claim never lingers past its real expiry. Re-minting
    // the server-side session cookie on every firing (sign-in, page load
    // with an existing session, or a background refresh) keeps proxy.ts's
    // cookie check from ever going stale independently of the same token.
    return onIdTokenChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setRole(null);
        setStatus("signed-out");
        return;
      }

      // The Firebase client SDK will already have created/linked this
      // account before we get here — this check is UX only, so a
      // wrong-domain sign-in never gets stuck in a confusing "signed in"
      // state. The real enforcement is server-side: session.ts rejects the
      // cookie mint, and api/app/auth.py rejects every data request,
      // independent of whatever the client claims.
      if (!isAllowedAccount(nextUser)) {
        await firebaseSignOut(auth);
        setUser(null);
        setRole(null);
        setStatus("signed-out");
        setError("Sign-in is restricted to lumenical.com Google accounts.");
        return;
      }

      const result = await nextUser.getIdTokenResult();
      const nextRole = result.claims.role;

      // Mint the server-side session cookie *before* flipping to
      // "signed-in" — AdminShell only renders the nav (and its <Link>s)
      // once status is "signed-in", and Next.js prefetches every visible
      // link immediately on mount. Flipping status first was letting that
      // prefetch race ahead of this POST: prefetches that hit proxy.ts
      // before the cookie existed got 307-redirected, and Next.js's
      // client-side Router Cache then kept serving that stale redirect for
      // real clicks on those links even after the cookie landed moments
      // later — no error, just a link that silently goes nowhere.
      await fetch(`${BASE_PATH}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: result.token }),
      }).catch(() => {
        // proxy.ts's redirect-to-login is only a UX convenience — the
        // Python API re-verifies a fresh ID token on every data request
        // regardless, so a failed cookie mint here isn't a security gap.
      });

      setUser(nextUser);
      setRole(nextRole === "admin" || nextRole === "editor" ? nextRole : null);
      setStatus("signed-in");
      setError(null);
    });
  }, []);

  async function signIn() {
    setError(null);
    const provider = new GoogleAuthProvider();
    // UI hint only (narrows Google's account chooser) — NOT the real
    // restriction; see isAllowedAccount() / session.ts / api/app/auth.py.
    provider.setCustomParameters({ hd: ALLOWED_ADMIN_EMAIL_DOMAIN });
    await signInWithPopup(auth, provider);
  }

  async function signOut() {
    await fetch(`${BASE_PATH}/api/session`, { method: "DELETE" }).catch(() => {});
    await firebaseSignOut(auth);
  }

  return (
    <AdminAuthContext.Provider value={{ status, user, role, error, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}
