import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  // admin/ is a fully independent Next.js app (own eslint.config.mjs, own
  // node_modules) — eslint-config-next's default ignores are root-relative
  // (`.next/**`, not `**/.next/**`), so without this, running lint here
  // after building admin/ locally scans its generated .next output too.
  { ignores: ["admin/**"] },
  ...nextCoreWebVitals,
];

export default config;
