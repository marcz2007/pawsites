/**
 * Native calendar model — the platform owns availability and bookings, instead
 * of mirroring a sitter's public Google Calendar. This is what powers the
 * "request -> orange, confirmed -> red" status colours and works for every
 * tenant with zero Google setup.
 *
 * Seeded here for now; maps to the `bookings` table in
 * supabase/migrations/0001_init.sql. A confirmed booking can later be pushed
 * to the tenant's Google Calendar via a single platform OAuth app (paid perk).
 */

export type BookingStatus =
  | "pending" // a new sit request just came in (shown orange / "tentative")
  | "confirmed" // sitter accepted (shown red / "busy")
  | "blocked"; // sitter's own time off (shown red / "busy")

export interface Booking {
  id: string;
  tenantSlug: string;
  /** Inclusive start date, YYYY-MM-DD. */
  start: string;
  /** Exclusive end date, YYYY-MM-DD (the checkout day). */
  end: string;
  status: BookingStatus;
  note?: string;
}

/** Dynamic, near-future seed dates so the demo calendar always shows activity. */
const SEED_BOOKINGS: Booking[] = [
  {
    id: "b1",
    tenantSlug: "happyathomepets",
    start: "2026-06-20",
    end: "2026-06-27",
    status: "confirmed",
    note: "Elsa (Lurcher) — repeat client",
  },
  {
    id: "b2",
    tenantSlug: "happyathomepets",
    start: "2026-07-04",
    end: "2026-07-06",
    status: "pending",
    note: "New request — awaiting meet & greet",
  },
  {
    id: "b3",
    tenantSlug: "happyathomepets",
    start: "2026-07-15",
    end: "2026-07-18",
    status: "blocked",
    note: "Personal time off",
  },
  {
    id: "b4",
    tenantSlug: "pawsandstay",
    start: "2026-06-18",
    end: "2026-06-24",
    status: "confirmed",
    note: "Bingo (Cockapoo)",
  },
  {
    id: "b5",
    tenantSlug: "pawsandstay",
    start: "2026-07-01",
    end: "2026-07-03",
    status: "pending",
    note: "New WhatsApp enquiry",
  },
];

export function getBookingsForTenant(slug: string): Booking[] {
  return SEED_BOOKINGS.filter((b) => b.tenantSlug === slug);
}
