#!/usr/bin/env node
/**
 * Fail fast on Vercel if Supabase client env vars are missing.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !anon || !service) {
  console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Fruit Booster deploy blocked: Supabase env vars missing.

  Required:
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY

  Also set AUTH_SECRET, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_WHATSAPP
  Project: https://akcyzqarqocxbxuprmlh.supabase.co
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  process.exit(1);
}

console.log("Supabase env looks valid. Continuing build…");
