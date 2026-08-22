import "server-only";
import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

// On Cloud Run this resolves Application Default Credentials and the
// project ID from the environment automatically — no service-account key
// file, matching the "no long-lived keys" posture the rest of this repo's
// deploy workflows already follow. For local dev against the Auth
// emulator, set FIREBASE_AUTH_EMULATOR_HOST (see .env.example);
// firebase-admin honors it automatically.
function initFirebaseAdmin(): App {
  return getApps().length ? getApps()[0] : initializeApp();
}

export const adminAuth: Auth = getAuth(initFirebaseAdmin());
