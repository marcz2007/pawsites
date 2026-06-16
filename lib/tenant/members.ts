import crypto from "crypto";
import { getSupabase } from "@/lib/supabase";

/** Membership + invite data access (service-role; server only). */

export async function getTenantIdBySlug(slug: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("tenants").select("id").eq("slug", slug).maybeSingle();
  return (data?.id as string) ?? null;
}

export async function addMembership(userId: string, tenantId: string): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured" };
  const { error } = await supabase
    .from("tenant_members")
    .upsert({ user_id: userId, tenant_id: tenantId }, { onConflict: "user_id,tenant_id" });
  return error ? { error: error.message } : {};
}

/** Tenant slugs a user may manage. */
export async function getTenantSlugsForUser(userId: string): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("tenant_members")
    .select("tenants!inner(slug)")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data
    .map((r) => (r.tenants as unknown as { slug: string } | null)?.slug)
    .filter((s): s is string => Boolean(s));
}

export async function createInvite(
  userId: string,
  tenantId: string,
  email: string
): Promise<{ token: string } | { error: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured" };
  const token = crypto.randomBytes(24).toString("base64url");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from("sitter_invites")
    .insert({ token, user_id: userId, tenant_id: tenantId, email, expires_at: expires });
  return error ? { error: error.message } : { token };
}

export async function getInvite(
  token: string
): Promise<{ userId: string; email: string } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("sitter_invites")
    .select("user_id, email, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) return null;
  return { userId: data.user_id as string, email: data.email as string };
}

export async function deleteInvite(token: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("sitter_invites").delete().eq("token", token);
}
