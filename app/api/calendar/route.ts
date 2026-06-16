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
    (override && getTenantBySlug(override)) ||
    (slugHeader && getTenantBySlug(slugHeader)) ||
    getTenantByHost(host) ||
    getDefaultTenant();

  const bookings = getBookingsForTenant(tenant.slug).map((b) => ({
    start: b.start,
    end: b.end,
    status: b.status,
  }));

  return NextResponse.json({ tenant: tenant.slug, bookings });
}
