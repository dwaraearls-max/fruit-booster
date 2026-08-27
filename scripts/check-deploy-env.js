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
  Fruit Fusion deploy blocked: DATABASE_URL is not set.

  Quick fix (free Neon Postgres):
    1. Locally run:  npx neon-new@latest --yes
    2. Copy DATABASE_URL + DATABASE_URL_DIRECT into Vercel
       → Project → Settings → Environment Variables
    3. Also set:
       AUTH_SECRET = <long random string>
       NEXT_PUBLIC_SITE_URL = https://<your-app>.vercel.app
       NEXT_PUBLIC_WHATSAPP = 233246572540
    4. Redeploy

  Or create a DB at https://neon.tech and paste the URLs.
  SQLite (file:./dev.db) will NOT work on Vercel.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  process.exit(1);
}

if (url.startsWith("file:")) {
  console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Fruit Fusion deploy blocked: DATABASE_URL is SQLite.
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
