import { headers } from "next/headers";
import { getDefaultTenant, getTenantByHost, getTenantBySlug } from "@/lib/tenant/store";
import type { Tenant } from "@/lib/tenant/types";

/**
 * Resolve the tenant for the current request, or `null` when the host belongs
 * to NO tenant (the apex / home domain). Middleware sets `x-tenant-slug` when a
 * subdomain/custom-domain maps to a tenant; we read it (cheap), then fall back
 * to the host. Returning null is the signal the home/marketing page branches on
 * (see app/page.tsx, app/layout.tsx).
 */
export async function resolveTenant(): Promise<Tenant | null> {
  const h = await headers();

  const slug = h.get("x-tenant-slug");
  if (slug) {
    const bySlug = await getTenantBySlug(slug);
    if (bySlug) return bySlug;
  }

  const host = h.get("host");
  return await getTenantByHost(host);
}

/**
 * Resolve the current tenant, falling back to the default tenant when the host
 * resolves to none. Use this where a tenant is always required (admin, APIs,
 * the legacy home-domain-as-tenant behaviour).
 */
export async function getCurrentTenant(): Promise<Tenant> {
  return (await resolveTenant()) ?? (await getDefaultTenant());
}
