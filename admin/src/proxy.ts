import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/session";

// Real, server-verified auth gating — replaces the old "client-side check is
// UX only" model. A signed-out deep link (e.g. /leads/) never reaches
// AdminShell's data-fetching components; it's redirected to `/`, where the
// same AdminShell renders LoginForm inline (unchanged UX). `/` itself is
// excluded below since it fetches no sensitive data even when unauthenticated.
export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!cookie || !(await verifySessionCookie(cookie))) {
    // Cloning nextUrl (not building a fresh URL from request.url) keeps
    // this basePath-aware — this app is served under /website, not the
    // domain root (next.config.mjs), and NextResponse.redirect only
    // re-adds that prefix when given a NextURL derived this way.
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Excludes: the root dashboard (renders its own login gate), /api/** (route
// handlers verify their own bearer tokens per request — see
// src/app/api/admin/[...path]/route.ts and Next's own Route Handler auth
// guidance), static assets, and the crawler-facing files that must stay
// reachable with no session at all (favicon, robots.txt).
export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon\\.svg|robots\\.txt|$).*)"],
};
