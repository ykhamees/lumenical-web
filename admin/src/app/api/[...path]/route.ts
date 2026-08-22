import { GoogleAuth } from "google-auth-library";

// Server-only, no NEXT_PUBLIC_ prefix — never reaches the browser. Points at
// the Python API's Cloud Run URL in production, or a locally-run `api/`
// instance in dev (see api/README.md).
const API_BASE_URL = process.env.ADMIN_API_BASE_URL;

let googleAuth: GoogleAuth | undefined;

/**
 * A Google-signed identity token for Cloud-Run-to-Cloud-Run service auth,
 * satisfying the API's `--no-allow-unauthenticated` IAM invoker check.
 * Cloud Run's IAM layer reads the *standard* `Authorization` header for
 * this — verified against live infrastructure; an earlier design assumed
 * an alternate `X-Serverless-Authorization` header existed for exactly
 * this "the app needs Authorization for something else too" case, but
 * that assumption was wrong (Cloud Run rejected the call outright). So the
 * Firebase user token below travels in a custom header instead, and this
 * one gets `Authorization`. Only fetched when actually running on Cloud
 * Run (`K_SERVICE` is a Cloud Run-injected env var) — local dev talks to a
 * locally-run api/ with no IAM in front of it.
 */
async function getIdentityAuthorizationHeader(audience: string): Promise<string | null> {
  if (!process.env.K_SERVICE) return null;

  googleAuth ??= new GoogleAuth();
  const client = await googleAuth.getIdTokenClient(audience);
  const headers = await client.getRequestHeaders();
  // google-auth-library returns "Authorization" (capitalized), not
  // lowercase — a plain-object key lookup is case-sensitive.
  return headers["Authorization"] ?? null;
}

// Publicly served at /website/api/** (basePath in next.config.mjs), not
// /api/**  — an unrelated app in this GCP org already owns bare /api/**
// routing at the shared edge (nginx + Keycloak), so this whole app lives
// under the /website prefix instead. The upstream Python API path below IS
// still /api/admin/**, unchanged — that's a direct server-to-server call
// to a different Cloud Run service, never touching the shared edge at all.
async function proxyToApi(request: Request, path: string[]): Promise<Response> {
  if (!API_BASE_URL) {
    return Response.json({ error: "ADMIN_API_BASE_URL not configured" }, { status: 500 });
  }

  const upstreamUrl = new URL(`/api/admin/${path.join("/")}`, API_BASE_URL);
  upstreamUrl.search = new URL(request.url).search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  // The browser's Firebase ID token (api/app/auth.py's require_admin_user
  // reads this, not Authorization — see the comment above).
  const firebaseIdToken = request.headers.get("authorization");
  if (firebaseIdToken) headers.set("x-firebase-id-token", firebaseIdToken);

  const identityAuthorization = await getIdentityAuthorizationHeader(API_BASE_URL);
  if (identityAuthorization) {
    headers.set("authorization", identityAuthorization);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
    });
  } catch {
    return Response.json({ error: "Upstream API unreachable" }, { status: 502 });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: {
      "content-type": upstreamResponse.headers.get("content-type") ?? "application/json",
    },
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: Request, { params }: RouteContext): Promise<Response> {
  const { path } = await params;
  return proxyToApi(request, path);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
