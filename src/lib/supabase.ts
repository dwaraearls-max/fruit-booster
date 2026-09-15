import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  supabaseAdmin: SupabaseClient | undefined;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Set it in .env.local (and Vercel).`);
  }
  return value;
}

/** Server-side Supabase client (bypasses RLS). Use only in API routes / server code. */
export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() must only run on the server.");
  }
  if (globalForSupabase.supabaseAdmin) return globalForSupabase.supabaseAdmin;

  const client = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  if (process.env.NODE_ENV !== "production") {
    globalForSupabase.supabaseAdmin = client;
  }

  return client;
}

export function isDbUnreachable(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return /fetch failed|network|econnrefused|enotfound|timed out|timeout|unreachable/i.test(
    msg,
  );
}

export function asDate(value: string | Date | null | undefined): Date {
  if (!value) return new Date(0);
  return value instanceof Date ? value : new Date(value);
}
