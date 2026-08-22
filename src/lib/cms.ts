import "server-only";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  collection,
  connectFirestoreEmulator,
  getDocsFromServer,
  getFirestore,
  orderBy,
  query,
  where,
} from "firebase/firestore";

// Local testing note: verified against the real Firestore emulator, this
// module's connectFirestoreEmulator() redirect does not reliably take
// effect under Turbopack's default `next build` static-generation workers
// (observed: falls through to the real backend, PERMISSION_DENIED) — but
// works correctly under `next build --webpack`, and an isolated plain-Node
// script confirms this module's actual query logic is correct either way.
// This only affects local emulator testing — production never sets
// NEXT_PUBLIC_USE_FIREBASE_EMULATOR, so connectFirestoreEmulator is never
// called there at all. To test locally against the emulator, use
// `next build --webpack` rather than the default Turbopack build.
//
// No live Firestore project exists yet (docs/infrastructure.md) — every
// export below checks this first and returns empty, attempting zero
// Firestore calls, so `deploy.yml`'s build step stays green until the
// owner provisions Firestore and sets this. Once set, a genuinely
// unreachable/misconfigured Firestore throws uncaught and fails the build
// loudly (docs/build-plan.md 5.1) — do not wrap the calls below in
// try/catch.
export function isCmsLive(): boolean {
  return process.env.NEXT_PUBLIC_CMS_LIVE === "true";
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

declare global {
  // Survives Turbopack re-evaluating this module across builds within the
  // same process — without it, connectFirestoreEmulator throws on a second
  // call ("emulator already running").
  var __cmsFirestoreEmulatorConnected: boolean | undefined;
}

function getDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  if (
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" &&
    !globalThis.__cmsFirestoreEmulatorConnected
  ) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    globalThis.__cmsFirestoreEmulatorConnected = true;
  }

  return db;
}

// The very first Firestore call right after connectFirestoreEmulator() in a
// freshly-spawned build worker can race the gRPC channel's initial setup
// and fail once, transiently — observed locally against the emulator under
// Next's parallel static-generation workers. A couple of quick retries
// absorb that without weakening 5.1's "fails loudly" intent: a genuinely
// unreachable/misconfigured Firestore still throws after they're exhausted.
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  throw new Error("unreachable");
}

export type SeoFields = { title: string | null; description: string | null };

export type PublishedPage = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  seo: SeoFields;
  order: number;
  tags: string[];
  publishedAt: string | null;
  updatedAt: string | null;
};

export type PublishedDemo = {
  id: string;
  slug: string;
  title: string;
  kind: "product" | "case-study";
  summary: string;
  body: string;
  mediaUrl: string | null;
  seo: SeoFields;
  order: number;
  publishedAt: string | null;
};

function toSeo(data: Record<string, unknown>): SeoFields {
  const seo = (data.seo as Record<string, unknown> | undefined) ?? {};
  return {
    title: typeof seo.title === "string" ? seo.title : null,
    description: typeof seo.description === "string" ? seo.description : null,
  };
}

function toIsoString(value: unknown): string | null {
  // Firestore Timestamps expose toDate(); anything else (or absent) is null.
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

function toPublishedPage(slug: string, data: Record<string, unknown>): PublishedPage {
  return {
    slug,
    title: typeof data.title === "string" ? data.title : "",
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    body: typeof data.body === "string" ? data.body : "",
    seo: toSeo(data),
    order: typeof data.order === "number" ? data.order : 0,
    tags: Array.isArray(data.tags) ? data.tags.filter((t): t is string => typeof t === "string") : [],
    publishedAt: toIsoString(data.publishedAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function toPublishedDemo(id: string, data: Record<string, unknown>): PublishedDemo {
  return {
    id,
    slug: typeof data.slug === "string" ? data.slug : "",
    title: typeof data.title === "string" ? data.title : "",
    kind: data.kind === "case-study" ? "case-study" : "product",
    summary: typeof data.summary === "string" ? data.summary : "",
    body: typeof data.body === "string" ? data.body : "",
    mediaUrl: typeof data.mediaUrl === "string" ? data.mediaUrl : null,
    seo: toSeo(data),
    order: typeof data.order === "number" ? data.order : 0,
    publishedAt: toIsoString(data.publishedAt),
  };
}

export async function getPublishedPages(): Promise<PublishedPage[]> {
  if (!isCmsLive()) return [];

  // getDocsFromServer, not getDocs — the plain client SDK's default read
  // can silently fall back to an empty local cache when the backend is
  // unreachable, resolving successfully with nothing rather than throwing.
  // That's exactly the silent-empty-page failure mode 5.1 rules out; the
  // server-only variant throws instead.
  const snapshot = await withRetry(() =>
    getDocsFromServer(
      query(collection(getDb(), "pages"), where("status", "==", "published"), orderBy("order"))
    )
  );
  return snapshot.docs.map((d) => toPublishedPage(d.id, d.data()));
}

export async function getPublishedPageBySlug(slug: string): Promise<PublishedPage | null> {
  // Delegates to the list query rather than a targeted single-doc get —
  // same "published" filtering guaranteed, and the dataset is small enough
  // that this costs nothing.
  const pages = await getPublishedPages();
  return pages.find((page) => page.slug === slug) ?? null;
}

export async function getPublishedDemos(): Promise<PublishedDemo[]> {
  if (!isCmsLive()) return [];

  const snapshot = await withRetry(() =>
    getDocsFromServer(
      query(collection(getDb(), "demos"), where("status", "==", "published"), orderBy("order"))
    )
  );
  return snapshot.docs.map((d) => toPublishedDemo(d.id, d.data()));
}

// `output: "export"` requires generateStaticParams() to return at least one
// entry for every dynamic route (no server exists to handle anything else
// at request time) — an empty list, whether from the CMS not being live yet
// or simply zero published items so far, falls back to this single
// placeholder slug. It never matches a real document, so the page/OG
// functions' existing `if (!item) notFound()` handles it correctly with no
// extra logic — it just satisfies the build-time "at least one" rule.
const STATIC_PARAMS_PLACEHOLDER = "_placeholder";

export function toSlugParams(items: { slug: string }[]): { slug: string }[] {
  return items.length > 0 ? items.map((item) => ({ slug: item.slug })) : [{ slug: STATIC_PARAMS_PLACEHOLDER }];
}

export async function getPublishedDemoBySlug(slug: string): Promise<PublishedDemo | null> {
  // Delegates to the list query rather than a targeted where("slug",...)
  // query — same "published" filtering guaranteed, and the dataset is
  // small enough that this costs nothing.
  const demos = await getPublishedDemos();
  return demos.find((demo) => demo.slug === slug) ?? null;
}
