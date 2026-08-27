#!/usr/bin/env node
/**
 * Push required env vars from local .env into Vercel (production + preview).
 * Usage: node scripts/sync-vercel-env.js
 * Requires: vercel CLI logged in + project linked (.vercel/)
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.error("Missing .env");
  process.exit(1);
}

const raw = fs.readFileSync(envPath, "utf8");
const parsed = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  parsed[key] = val;
}

const keys = [
  "DATABASE_URL",
  "DATABASE_URL_DIRECT",
  "AUTH_SECRET",
  "NEXT_PUBLIC_WHATSAPP",
  "PAYMENT_PROVIDER",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

// Prefer production site URL if provided; otherwise leave for manual set after first deploy
if (process.env.SITE_URL) {
  parsed.NEXT_PUBLIC_SITE_URL = process.env.SITE_URL;
  keys.splice(3, 0, "NEXT_PUBLIC_SITE_URL");
}

function upsert(key, value, environment) {
  // Remove existing (ignore errors), then add
  spawnSync("vercel", ["env", "rm", key, environment, "--yes"], {
    stdio: "pipe",
    shell: true,
  });
  const result = spawnSync("vercel", ["env", "add", key, environment], {
    input: value + "\n",
    encoding: "utf8",
    shell: true,
  });
  if (result.status !== 0) {
    console.error(`Failed to set ${key} (${environment}):`, result.stderr || result.stdout);
    return false;
  }
  console.log(`Set ${key} → ${environment}`);
  return true;
}

if (!fs.existsSync(path.join(process.cwd(), ".vercel", "project.json"))) {
  console.error("Project not linked. Run: vercel link");
  process.exit(1);
}

let ok = true;
for (const key of keys) {
  const value = parsed[key];
  if (!value) {
    console.warn(`Skipping ${key} (not in .env)`);
    continue;
  }
  if (/\[YOUR-PASSWORD\]|\[REGION\]|REPLACE_WITH/i.test(value)) {
    console.warn(`Skipping ${key} (placeholder value)`);
    continue;
  }
  for (const env of ["production", "preview"]) {
    if (!upsert(key, value, env)) ok = false;
  }
}

process.exit(ok ? 0 : 1);
