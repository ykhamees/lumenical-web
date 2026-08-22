---
name: update-dependencies
description: Check for and apply dependency/tooling updates on the Lumenical site — npm audit fixes, Next.js/Tailwind/TypeScript version bumps — verifying the static export and build still work afterward. Use periodically, or when npm audit / Dependabot / the user flags an outdated or vulnerable package.
when_to_use: "check for dependency updates", "npm audit", "update Next.js", "are we on the latest version", "fix vulnerabilities"
context: fork
agent: lumenical-deps
---

Check `npm outdated` and `npm audit`, and apply any updates that resolve real advisories or meaningful staleness — following the upgrade procedure of reading changelogs for major bumps, reinstalling clean (`rm -rf node_modules package-lock.json && npm install`), and verifying with `npm run build`, `npm run lint`, `npx tsc --noEmit`, and `npm audit` afterward.

`output: "export"` in `next.config.mjs` must survive any Next.js upgrade — this site deploys as static HTML with no server. Report exactly what changed and why (security fix vs. routine currency).
