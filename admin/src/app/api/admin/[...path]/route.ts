import { GoogleAuth } from "google-auth-library";

// Server-only, no NEXT_PUBLIC_ prefix — never reaches the browser. Points at
// the Python API's Cloud Run URL in production, or a locally-run `api/`
// instance in dev (see api/README.md).
const API_BASE_URL = process.env.ADMIN_API_BASE_URL;

let googleAuth: GoogleAuth | undefined;

/**
 * A Google-signed identity token for Cloud-Run-to-Cloud-Run service auth,
 * satisfying the API's `--no-allow-unauthenticated` IAM invoker check.
 * Carried in `X-Serverless-Authorization` (Cloud Run's alternate header for
 * exactly this case) rather than `Authorization`, so it never collides with
 * the caller's own Firebase ID token forwarded below. Only fetched when
 * actually running on Cloud Run (`K_SERVICE` is a Cloud Run-injected env
 * var) — local dev talks to a locally-run api/ with no IAM in front of it.
 */
async function getServerlessAuthorizationHeader(audience: string): Promise<string | null> {
  if (!process.env.K_SERVICE) return null;

  googleAuth ??= new GoogleAuth();
  const client = await googleAuth.getIdTokenClient(audience);
  const headers = await client.getRequestHeaders();
  return headers["authorization"] ?? null;
}

async function proxyToApi(request: Request, path: string[]): Promise<Response> {
  if (!API_BASE_URL) {
    return Response.json({ error: "ADMIN_API_BASE_URL not configured" }, { status: 500 });
  }

  const upstreamUrl = new URL(`/api/admin/${path.join("/")}`, API_BASE_URL);
  upstreamUrl.search = new URL(request.url).search;

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const serverlessAuthorization = await getServerlessAuthorizationHeader(API_BASE_URL);
  if (serverlessAuthorization) {
    headers.set("x-serverless-authorization", serverlessAuthorization);
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
