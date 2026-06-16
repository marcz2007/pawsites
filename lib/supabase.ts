import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service_role key. NEVER import this
 * into client components — the service key bypasses Row-Level Security.
 *
 * Returns null when env vars are absent, so callers can fall back to seed data
 * (keeps local dev and the app working even without a database).
 */
let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    cached = null;
    return null;
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
