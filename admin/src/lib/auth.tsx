"use client";

import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BASE_PATH } from "./base-path";
import { auth } from "./firebase-client";

type Role = "admin" | "editor" | null;
type Status = "loading" | "signed-out" | "signed-in";

type AdminAuthContextValue = {
  status: Status;
  user: User | null;
  role: Role;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);

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
      const result = await nextUser.getIdTokenResult();
      const nextRole = result.claims.role;
      setUser(nextUser);
      setRole(nextRole === "admin" || nextRole === "editor" ? nextRole : null);
      setStatus("signed-in");

      await fetch(`${BASE_PATH}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: result.token }),
      }).catch(() => {
        // proxy.ts's redirect-to-login is only a UX convenience — the
        // Python API re-verifies a fresh ID token on every data request
        // regardless, so a failed cookie mint here isn't a security gap.
      });
    });
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut() {
    await fetch(`${BASE_PATH}/api/session`, { method: "DELETE" }).catch(() => {});
    await firebaseSignOut(auth);
  }

  return (
    <AdminAuthContext.Provider value={{ status, user, role, signIn, signOut }}>
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
