import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Served at lumenical.com/website/** via a firebase.json Hosting rewrite
  // to this Cloud Run service, not its own subdomain — another, unrelated
  // app in this GCP org already owns bare /api/** routing (nginx +
  // Keycloak), so this app's own root must be a distinct path prefix, not
  // the domain root. Must stay in sync with src/lib/base-path.ts (next/link
  // and page routing pick this up automatically; plain fetch() calls don't
  // and need that constant manually) and firebase.json's rewrite source.
  basePath: "/website",
  // firebase.json's rewrite source is "/website/**", which requires the
  // trailing slash to match at all -- without this, Next's default
  // trailing-slash-stripping redirect (/website/ -> /website) sends every
  // real request to a URL the rewrite doesn't cover, which then falls
  // through to the marketing app's own static 404 page. Confirmed live:
  // this was breaking every visit to lumenical.com/website/ in production.
  trailingSlash: true,
  // Without this, Turbopack finds the marketing app's lockfile one level up
  // and infers the wrong workspace root — this repo isn't an npm workspace,
  // admin/ is fully independent (see CLAUDE.md).
  turbopack: { root: __dirname },
};

export default nextConfig;
