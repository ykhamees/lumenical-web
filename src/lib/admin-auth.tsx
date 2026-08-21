"use client";

import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
    // forged/expired claim never lingers past its real expiry.
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
    });
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut() {
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
