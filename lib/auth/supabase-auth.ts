import { getSupabase } from "@/lib/supabase";

/**
 * Sitter identity via Supabase Auth, driven entirely server-side with the
 * service_role key — no anon key or browser auth client needed.
 *  - createUser / setPassword use the admin API.
 *  - signIn calls the GoTrue token endpoint (service_role works as the apikey).
 */

export async function createAuthUser(email: string): Promise<{ id: string } | { error: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured" };
  // Create with a random temp password; the invite flow sets the real one.
  const tempPassword = `tmp_${crypto.randomUUID()}`;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });
  if (error || !data.user) return { error: error?.message || "Could not create user" };
  return { id: data.user.id };
}

export async function setUserPassword(userId: string, password: string): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured" };
  const { error } = await supabase.auth.admin.updateUserById(userId, { password });
  return error ? { error: error.message } : {};
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ id: string; email: string } | { error: string }> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { error: "Auth not configured" };

  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return { error: "Incorrect email or password" };
    const data = (await res.json()) as { user?: { id: string; email: string } };
    if (!data.user) return { error: "Incorrect email or password" };
    return { id: data.user.id, email: data.user.email };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Sign-in failed" };
  }
}
