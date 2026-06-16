import { headers } from "next/headers";
import { getDefaultTenant, getTenantByHost, getTenantBySlug } from "@/lib/tenant/store";
import type { Tenant } from "@/lib/tenant/types";

/**
 * Resolve the current tenant inside a Server Component or Route Handler.
 *
 * Middleware (middleware.ts) sets the `x-tenant-slug` header on every request
 * after resolving it from the host, so this is a cheap header read. We fall
 * back to parsing the host directly, then to the default tenant, so the site
 * always renders something during development.
 */
export async function getCurrentTenant(): Promise<Tenant> {
  const h = await headers();

  const slug = h.get("x-tenant-slug");
  if (slug) {
    const bySlug = getTenantBySlug(slug);
    if (bySlug) return bySlug;
  }

  const host = h.get("host");
  return getTenantByHost(host) ?? getDefaultTenant();
}
