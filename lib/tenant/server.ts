import { headers } from "next/headers";
import { getDefaultTenant, getTenantByHost, getTenantBySlug } from "@/lib/tenant/store";
import type { Tenant } from "@/lib/tenant/types";

/**
 * Resolve the current tenant inside a Server Component or Route Handler.
 * Middleware sets `x-tenant-slug`; we read it (cheap), then fall back to the
 * host, then to the default tenant.
 */
export async function getCurrentTenant(): Promise<Tenant> {
  const h = await headers();

  const slug = h.get("x-tenant-slug");
  if (slug) {
    const bySlug = await getTenantBySlug(slug);
    if (bySlug) return bySlug;
  }

  const host = h.get("host");
  return (await getTenantByHost(host)) ?? (await getDefaultTenant());
}
