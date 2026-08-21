#!/usr/bin/env node
// PostToolUse hook (Write|Edit): lints a just-changed .ts/.tsx file with the
// project's own ESLint flat config, so lint errors surface in-turn without
// requiring a full `npm run lint`. Silent on success or on non-TS files.
"use strict";

const { execFileSync } = require("child_process");
const path = require("path");

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    return;
  }

  const file =
    (payload.tool_response && payload.tool_response.filePath) ||
    (payload.tool_input && payload.tool_input.file_path) ||
    "";

  if (!/\.tsx?$/.test(file)) return;

  const repoRoot = path.resolve(__dirname, "..", "..");
  // Invoke ESLint's JS entrypoint directly with `node`, rather than the
  // npx/eslint.cmd wrapper — execFileSync can't run .cmd files on Windows
  // without shell:true, which would reintroduce shell-quoting risk.
  const eslintBin = path.join(repoRoot, "node_modules", "eslint", "bin", "eslint.js");

  try {
    execFileSync(process.execPath, [eslintBin, file], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const output = String((err.stdout || "") + (err.stderr || "")).slice(0, 4000);
    if (output.trim()) {
      process.stdout.write(JSON.stringify({ decision: "block", reason: output }));
    }
  }
});
