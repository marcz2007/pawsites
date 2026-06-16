import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Minimal operator auth for the admin portal. A single password (env
 * ADMIN_PASSWORD) gates /admin. The cookie stores a SHA-256 of the password,
 * not the password itself, and is verified server-side.
 *
 * This is deliberately simple for Phase 3a (operator edits any tenant). Phase 3b
 * replaces it with per-sitter Supabase Auth + per-tenant access.
 *
 * Dev convenience: if ADMIN_PASSWORD is unset, the password "dev" works in
 * development only. In production, an unset ADMIN_PASSWORD disables admin login.
 */
export const ADMIN_COOKIE = "pawsites_admin";

function configuredPassword(): string | null {
  return process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "dev" : null);
}

function hash(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

/** The cookie token value clients must present (hex SHA-256 of the password). */
export function adminToken(): string | null {
  const pw = configuredPassword();
  return pw ? hash(pw).toString("hex") : null;
}

export function passwordMatches(input: string): boolean {
  const pw = configuredPassword();
  if (!pw) return false;
  const a = hash(input);
  const b = hash(pw);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const token = adminToken();
  if (!token) return false;
  const store = await cookies();
  const val = store.get(ADMIN_COOKIE)?.value;
  return Boolean(val && val === token);
}

/** Use at the top of a protected admin page; redirects to login if not authed. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
