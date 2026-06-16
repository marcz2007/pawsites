import { getSupabase } from "@/lib/supabase";

/**
 * Native calendar model — the platform owns availability and bookings, instead
 * of mirroring a sitter's public Google Calendar. Reads from Supabase when
 * configured, falling back to seed bookings otherwise.
 */

export type BookingStatus = "pending" | "confirmed" | "blocked";

export interface Booking {
  tenantSlug: string;
  /** Inclusive start date, YYYY-MM-DD. */
  start: string;
  /** Exclusive end date, YYYY-MM-DD (the checkout day). */
  end: string;
  status: BookingStatus;
  note?: string;
}

/** Seed bookings — also used to populate the DB via the dev seed route. */
export const SEED_BOOKINGS: Booking[] = [
  { tenantSlug: "happyathomepets", start: "2026-06-20", end: "2026-06-27", status: "confirmed", note: "Elsa (Lurcher) — repeat client" },
  { tenantSlug: "happyathomepets", start: "2026-07-04", end: "2026-07-06", status: "pending", note: "New request — awaiting meet & greet" },
  { tenantSlug: "happyathomepets", start: "2026-07-15", end: "2026-07-18", status: "blocked", note: "Personal time off" },
  { tenantSlug: "pawsandstay", start: "2026-06-18", end: "2026-06-24", status: "confirmed", note: "Bingo (Cockapoo)" },
  { tenantSlug: "pawsandstay", start: "2026-07-01", end: "2026-07-03", status: "pending", note: "New WhatsApp enquiry" },
];

/** Booking shape returned to the calendar UI / API. */
export interface PublicBooking {
  start: string;
  end: string;
  status: BookingStatus;
}

function seedFor(slug: string): PublicBooking[] {
  return SEED_BOOKINGS.filter((b) => b.tenantSlug === slug).map(({ start, end, status }) => ({
    start,
    end,
    status,
  }));
}

export async function getBookingsForTenant(slug: string): Promise<PublicBooking[]> {
  const supabase = getSupabase();
  if (!supabase) return seedFor(slug);

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("start_date, end_date, status, tenants!inner(slug)")
      .eq("tenants.slug", slug);

    if (error) {
      console.error(`BOOKINGS_DB_ERROR [${slug}]`, error.message);
      return seedFor(slug);
    }
    return (data ?? []).map((r) => ({
      start: r.start_date as string,
      end: r.end_date as string,
      status: r.status as BookingStatus,
    }));
  } catch (err) {
    console.error(`BOOKINGS_DB_EXCEPTION [${slug}]`, err);
    return seedFor(slug);
  }
}
