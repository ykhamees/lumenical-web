import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

declare global {
  // Survives Next.js dev Fast Refresh re-evaluating this module — without
  // it, connectAuthEmulator/connectFirestoreEmulator throw on the second
  // call ("emulator already running").
  var __firebaseEmulatorsConnected: boolean | undefined;
}

// Server-rendered pages execute client components once in Node before any
// browser is involved — Firebase's client SDK expects a real browser and
// throws immediately on a missing/placeholder API key. Deferring
// initialization until an actual browser runs this keeps SSR working with
// no Firebase config set.
function initFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  if (typeof window === "undefined") {
    return null;
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" &&
    !globalThis.__firebaseEmulatorsConnected
  ) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    globalThis.__firebaseEmulatorsConnected = true;
  }

  return { app, auth, db };
}

const firebase = initFirebase();

// Only ever consumed client-side (inside effects/event handlers, in
// components under AdminAuthProvider) — by the time anything calls these,
// firebase is guaranteed non-null.
export const auth = firebase?.auth as Auth;
export const db = firebase?.db as Firestore;
