import { redirect } from "next/navigation";
import { isAdmin as isOperatorPassword } from "@/lib/admin/auth";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { getTenantSlugsForUser } from "@/lib/tenant/members";

/**
 * Unified admin access. Two kinds of user:
 *  - Operator (you): the ADMIN_PASSWORD cookie, OR a session user whose email is
 *    listed in ADMIN_EMAILS. Sees and edits ALL tenants; can invite sitters.
 *  - Sitter: a logged-in session user. Sees/edits ONLY their own tenant(s).
 */
export interface Access {
  isOperator: boolean;
  user: SessionUser | null;
  /** Tenant slugs this actor may edit; undefined means "all" (operator). */
  tenantSlugs?: string[];
}

function operatorEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAccess(): Promise<Access | null> {
  const user = await getSessionUser();

  if (await isOperatorPassword()) {
    return { isOperator: true, user };
  }
  if (user && operatorEmails().includes(user.email.toLowerCase())) {
    return { isOperator: true, user };
  }
  if (user) {
    const slugs = await getTenantSlugsForUser(user.uid);
    return { isOperator: false, user, tenantSlugs: slugs };
  }
  return null;
}

/** Redirects to the right login if there's no access. */
export async function requireAccess(): Promise<Access> {
  const access = await getAccess();
  if (!access) redirect("/login");
  return access;
}

export function canEdit(access: Access, slug: string): boolean {
  if (access.isOperator) return true;
  return Boolean(access.tenantSlugs?.includes(slug));
}
