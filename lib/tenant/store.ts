import { DEFAULT_TENANT_SLUG, SEED_TENANTS } from "@/lib/tenant/seed";
import { rowToTenant, type TenantRow } from "@/lib/tenant/mapping";
import { getSupabase } from "@/lib/supabase";
import type { Tenant } from "@/lib/tenant/types";

/**
 * Tenant data-access layer. Reads from Supabase when configured, falling back
 * to the in-code seed (lib/tenant/seed.ts) when the DB is absent, errors, or
 * has no matching row. This is the ONLY file that knows where tenants come from.
 */

/** Custom domains mapped to their tenant slug (paid-tier "bring your domain"). */
const CUSTOM_DOMAINS: Record<string, string> = {
  "happyathomepets.co.uk": "happyathomepets",
  "www.happyathomepets.co.uk": "happyathomepets",
};

/** Base domains the platform serves subdomains under. */
const PLATFORM_DOMAINS = ["pawsites.co.uk", "localhost", "vercel.app"];

function seedBySlug(slug: string): Tenant | null {
  return SEED_TENANTS.find((t) => t.slug === slug) ?? null;
}

/**
 * Resolve which tenant a request host belongs to (pure — used by middleware).
 *  - custom domain (happyathomepets.co.uk)      -> mapped slug
 *  - subdomain of a platform domain (foo.pawsites.co.uk / foo.localhost) -> "foo"
 *  - apex / www / unknown                        -> null
 */
export function slugFromHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase().trim();

  if (CUSTOM_DOMAINS[hostname]) return CUSTOM_DOMAINS[hostname];

  const base = PLATFORM_DOMAINS.find((d) => hostname === d || hostname.endsWith(`.${d}`));
  if (!base) return null;

  const sub = hostname === base ? "" : hostname.slice(0, -(base.length + 1));
  if (!sub || sub === "www") return null;
  return sub.split(".")[0];
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = getSupabase();
  if (!supabase) return seedBySlug(slug);

  try {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(`TENANT_DB_ERROR [${slug}]`, error.message);
      return seedBySlug(slug);
    }
    return data ? rowToTenant(data as TenantRow) : seedBySlug(slug);
  } catch (err) {
    console.error(`TENANT_DB_EXCEPTION [${slug}]`, err);
    return seedBySlug(slug);
  }
}

export async function getTenantByHost(host: string | null | undefined): Promise<Tenant | null> {
  const slug = slugFromHost(host);
  return slug ? getTenantBySlug(slug) : null;
}

export async function getDefaultTenant(): Promise<Tenant> {
  return (await getTenantBySlug(DEFAULT_TENANT_SLUG)) ?? SEED_TENANTS[0];
}
