# Setup — what needs a human (accounts, DNS, secrets)

The code runs locally with zero setup (tenants are seeded in code). The steps
below are needed to take it live and to enable Phase 2+. None of these can be
done from code alone — they need your accounts.

## 1. Domain — `pawsites.co.uk`
- Buy it (you found it ~£5.20/yr).
- In Vercel, add it to the project **plus the wildcard** `*.pawsites.co.uk`
  (so `anyname.pawsites.co.uk` resolves to the app).
- DNS: follow Vercel's records (usually a CNAME for the wildcard + the apex).

## 2. Vercel project
- Push this repo to GitHub, then "New Project" in Vercel from it.
- It deploys with no env vars (seed tenants render). Add env vars below to
  enable email + sheet capture.

## 3. Email (Plus tier) — Resend
- Add a sending domain in Resend, e.g. `pawsites.co.uk` (or `mail.pawsites.co.uk`).
- Add the DKIM/DMARC records Resend gives you — **once**, for the platform.
- Env vars:
  - `RESEND_API_KEY` — from Resend
  - `RESEND_FROM` — e.g. `enquiries@pawsites.co.uk`
- Each tenant's enquiry routes to `tenant.enquiry.toEmail` (set per tenant).

## 4. Google Sheet lead log (optional redundancy, reused from happyathomepets)
- Per-tenant: set `GOOGLE_SHEET_WEBHOOK_URL_<SLUG>` (e.g.
  `GOOGLE_SHEET_WEBHOOK_URL_HAPPYATHOMEPETS`), or a platform-wide
  `GOOGLE_SHEET_WEBHOOK_URL` fallback, plus `GOOGLE_SHEET_SHARED_SECRET`.
- The Apps Script is the same pattern as the happyathomepets `docs/` script.

## 5. Supabase (Phase 2 — database)
- Create a free Supabase project.
- Run `supabase/migrations/0001_init.sql` (SQL editor or CLI).
- Then swap `lib/tenant/store.ts` from the seed to Supabase queries (the only
  file that needs to change — everything else consumes the same `Tenant` type).
- Env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## 6. Google Calendar sync (later, optional paid perk)
- One OAuth app in **your** Google Cloud Console (Calendar API).
- Tenants click "Connect Google Calendar" in the admin → consent → store token.
- On booking confirm, push the event to their calendar. No per-tenant console.

## Decisions still open
- Admin portal scope for v1 (how much self-serve vs you onboarding via DB).
- Auth provider (Supabase Auth vs Clerk).
- Image storage (Vercel Blob vs Cloudflare R2) for tenant photos.
- Free-tier "Powered by Pawsites" badge (currently shown in the footer).
