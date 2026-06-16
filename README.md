# Pawsites

Multi-tenant website platform for pet-care businesses. One Next.js app serves
many sitters/boarders; each is a **tenant** resolved from the request hostname,
with its own content, pricing, contact details, and tier.

See **`PLAN.md`** for the product/architecture plan and **`SETUP.md`** for the
accounts/DNS/secrets needed to go live.

## How it works

- **Tenant model** — `lib/tenant/types.ts`. Each business is one `Tenant`.
- **Seed data** — `lib/tenant/seed.ts`. Two tenants today:
  - `happyathomepets` — the real first customer, **Plus** tier (email enabled).
  - `pawsandstay` — a demo Bristol boarder, **Free** tier (WhatsApp only).
- **Resolution** — `middleware.ts` reads the host and sets `x-tenant-slug`;
  Server Components read it via `lib/tenant/server.ts` (`getCurrentTenant()`).
- **Data source** — `lib/tenant/store.ts` is the only file that knows where
  tenants come from (today: seed; later: Supabase — see `supabase/migrations`).
- **Pricing** — per-tenant `PricingConfig`; the calculator (`components/pricing.tsx`)
  adapts which option cards it shows to what the tenant offers.
- **Enquiries** — `app/api/enquiry/route.ts` routes per tenant (email +
  Google Sheet), free tier = WhatsApp-only + logged.
- **Calendar** — native bookings (`lib/tenant/calendar.ts`,
  `app/api/calendar/route.ts`); status drives green/orange/red.

## Local development

```bash
pnpm dev
```

- Default tenant (`happyathomepets`): http://localhost:3000
- Preview a specific tenant two ways:
  - subdomain: http://pawsandstay.localhost:3000
  - query override: http://localhost:3000/?tenant=pawsandstay

## Adding a tenant (today)

Add a `Tenant` object to `lib/tenant/seed.ts`. Once Supabase is wired up
(Phase 2), this becomes a database row / admin-portal form instead.

## Status

Phase 1 (multi-tenant foundation) is in place and type-checks clean. Next:
Supabase (Phase 2) and the admin portal (Phase 3) — both need the setup steps
in `SETUP.md`.
