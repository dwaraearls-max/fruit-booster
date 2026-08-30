#!/usr/bin/env node
/**
 * Fail fast on Vercel if DATABASE_URL is missing or still points at SQLite.
 * Ensures DATABASE_URL_DIRECT is set (Prisma schema requires it).
 */
const fs = require("fs");
const path = require("path");

const url = process.env.DATABASE_URL || "";

if (!url) {
  console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Fruit Booster deploy blocked: DATABASE_URL is not set.

  Quick fix (Supabase Postgres):
    1. Open https://supabase.com/dashboard/project/akcyzqarqocxbxuprmlh/settings/database
    2. Copy Transaction pooler URI → DATABASE_URL (add ?pgbouncer=true)
    3. Copy Session/Direct URI → DATABASE_URL_DIRECT
    4. Also set AUTH_SECRET, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_WHATSAPP
    5. Redeploy

  Project: https://akcyzqarqocxbxuprmlh.supabase.co
  SQLite (file:./dev.db) will NOT work on Vercel.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  process.exit(1);
}

if (url.startsWith("file:")) {
  console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Fruit Booster deploy blocked: DATABASE_URL is SQLite.
  Use a PostgreSQL URL from Neon (npx neon-new@latest --yes).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  process.exit(1);
}

if (!process.env.DATABASE_URL_DIRECT) {
  // Pooled Neon URLs often fail for migrations; prefer removing "-pooler" when possible.
  let direct = url;
  if (url.includes("-pooler.")) {
    direct = url.replace("-pooler.", ".");
  }
  process.env.DATABASE_URL_DIRECT = direct;
  console.log("DATABASE_URL_DIRECT not set — derived from DATABASE_URL for this build.");
}

console.log("DATABASE_URL looks valid (Postgres). Continuing build…");
