import { DEFAULT_TENANT_SLUG, SEED_TENANTS } from "@/lib/tenant/seed";
import type { Tenant } from "@/lib/tenant/types";

/**
 * Tenant data-access layer. Today it reads from the in-code seed; later this
 * is the ONLY file that changes to read from Supabase instead. Everything else
 * depends on these functions, not on the data source.
 */

/** Custom domains mapped to their tenant slug (paid-tier "bring your domain"). */
const CUSTOM_DOMAINS: Record<string, string> = {
  "happyathomepets.co.uk": "happyathomepets",
  "www.happyathomepets.co.uk": "happyathomepets",
};

/** Base domains the platform serves subdomains under. */
const PLATFORM_DOMAINS = ["pawsites.co.uk", "localhost", "vercel.app"];

export function getAllTenants(): Tenant[] {
  return SEED_TENANTS;
}

export function getTenantBySlug(slug: string): Tenant | null {
  return SEED_TENANTS.find((t) => t.slug === slug) ?? null;
}

export function getDefaultTenant(): Tenant {
  return getTenantBySlug(DEFAULT_TENANT_SLUG) ?? SEED_TENANTS[0];
}

/**
 * Resolve which tenant a request host belongs to.
 *  - custom domain (happyathomepets.co.uk)      -> mapped slug
 *  - subdomain of a platform domain (foo.pawsites.co.uk / foo.localhost) -> "foo"
 *  - apex / www / unknown                        -> null (caller decides fallback)
 */
export function slugFromHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase().trim();

  if (CUSTOM_DOMAINS[hostname]) return CUSTOM_DOMAINS[hostname];

  const base = PLATFORM_DOMAINS.find(
    (d) => hostname === d || hostname.endsWith(`.${d}`)
  );
  if (!base) return null;

  // Everything before the base domain; ignore "www" and the apex itself.
  const sub = hostname === base ? "" : hostname.slice(0, -(base.length + 1));
  if (!sub || sub === "www") return null;

  // Use the left-most label as the slug (foo.bar.pawsites.co.uk -> "foo").
  return sub.split(".")[0];
}

export function getTenantByHost(host: string | null | undefined): Tenant | null {
  const slug = slugFromHost(host);
  return slug ? getTenantBySlug(slug) : null;
}
