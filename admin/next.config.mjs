import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Without this, Turbopack finds the marketing app's lockfile one level up
  // and infers the wrong workspace root — this repo isn't an npm workspace,
  // admin/ is fully independent (see CLAUDE.md).
  turbopack: { root: __dirname },
};

export default nextConfig;
