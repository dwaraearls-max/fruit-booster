#!/usr/bin/env node
/**
 * Vercel production build: validate env → seed → next build
 */
const { spawnSync } = require("child_process");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

require("./check-deploy-env.js");

run("npx", ["tsx", "scripts/seed.ts"]);
run("npx", ["next", "build"]);
