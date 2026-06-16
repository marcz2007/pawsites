import { NextResponse } from "next/server";
import { getBookingsForTenant } from "@/lib/tenant/calendar";
import { getDefaultTenant, getTenantByHost, getTenantBySlug } from "@/lib/tenant/store";

/**
 * Returns the current tenant's bookings (availability is "available unless a
 * booking says otherwise"). Replaces the old Google Calendar API-key read.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const override = searchParams.get("tenant");
  const slugHeader = request.headers.get("x-tenant-slug");
  const host = request.headers.get("host");

  const tenant =
    (override ? await getTenantBySlug(override) : null) ||
    (slugHeader ? await getTenantBySlug(slugHeader) : null) ||
    (await getTenantByHost(host)) ||
    (await getDefaultTenant());

  const bookings = await getBookingsForTenant(tenant.slug);
  return NextResponse.json({ tenant: tenant.slug, bookings });
}
