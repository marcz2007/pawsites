import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { SEED_TENANTS } from "@/lib/tenant/seed";
import { SEED_BOOKINGS } from "@/lib/tenant/calendar";
import { tenantToRow } from "@/lib/tenant/mapping";

/**
 * One-off seed: loads the seed tenants + bookings into Supabase. Idempotent
 * (upserts tenants by slug, replaces their bookings). Dev-only — disabled in
 * production. Run with: curl -X POST http://localhost:3000/api/dev/seed
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 }
    );
  }

  // 1) Upsert tenants by slug.
  const rows = SEED_TENANTS.map(tenantToRow);
  const { data: upserted, error: tErr } = await supabase
    .from("tenants")
    .upsert(rows, { onConflict: "slug" })
    .select("id, slug");
  if (tErr) {
    return NextResponse.json({ error: `tenants: ${tErr.message}` }, { status: 500 });
  }

  const idBySlug = new Map((upserted ?? []).map((r) => [r.slug as string, r.id as string]));
  const tenantIds = [...idBySlug.values()];

  // 2) Replace bookings for these tenants.
  if (tenantIds.length) {
    await supabase.from("bookings").delete().in("tenant_id", tenantIds);
  }
  const bookingRows = SEED_BOOKINGS.map((b) => ({
    tenant_id: idBySlug.get(b.tenantSlug),
    start_date: b.start,
    end_date: b.end,
    status: b.status,
    note: b.note ?? null,
  })).filter((b) => b.tenant_id);

  const { error: bErr } = await supabase.from("bookings").insert(bookingRows);
  if (bErr) {
    return NextResponse.json({ error: `bookings: ${bErr.message}` }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    tenants: upserted?.map((r) => r.slug),
    bookings: bookingRows.length,
  });
}
