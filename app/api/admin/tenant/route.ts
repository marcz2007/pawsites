import { NextResponse } from "next/server";
import { getAccess } from "@/lib/admin/access";
import { RESERVED_SLUGS, SLUG_RE, newTenant, slugify } from "@/lib/tenant/defaults";
import { createTenant } from "@/lib/tenant/store";
import type { Tier } from "@/lib/tenant/types";

/** Operator-only: create a new tenant (site) with sensible defaults. */
export async function POST(request: Request) {
  const access = await getAccess();
  if (!access?.isOperator) {
    return NextResponse.json({ error: "Operator only" }, { status: 403 });
  }

  const { businessName, slug, locationLabel, tier } = (await request
    .json()
    .catch(() => ({}))) as {
    businessName?: string;
    slug?: string;
    locationLabel?: string;
    tier?: Tier;
  };

  if (!businessName?.trim()) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }

  const cleanSlug = slugify(slug || businessName);
  if (!SLUG_RE.test(cleanSlug)) {
    return NextResponse.json(
      { error: "Subdomain must be lowercase letters, numbers and hyphens" },
      { status: 400 }
    );
  }
  if (RESERVED_SLUGS.has(cleanSlug)) {
    return NextResponse.json({ error: "That subdomain is reserved" }, { status: 400 });
  }

  const tenant = newTenant({
    slug: cleanSlug,
    businessName: businessName.trim(),
    locationLabel: locationLabel?.trim(),
    tier: tier === "plus" ? "plus" : "free",
  });

  const result = await createTenant(tenant);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, slug: cleanSlug });
}
