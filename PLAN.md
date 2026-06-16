# Pawsites — multi-tenant pet-care website platform

Turn the Happy at Home Pets site into a product: a "bare-bones" website other
pet-care businesses (sitters, boarders, walkers, daycare) can sign up for, add
their own content + pricing, and run on their own subdomain or custom domain.

Niche-first (pet care), with the same architecture later reusable for other
local-service verticals (e.g. babysitting) as additional base domains on the
same app.

---

## Core architecture decision

**One multi-tenant Next.js app serves every customer.** A request's hostname
decides which tenant's content + pricing to render. One codebase, one Vercel
deployment, hundreds of tenants — so the marginal cost per customer is ~£0,
which is what makes £5/month viable.

- `pawsites.co.uk` — the platform. Wildcard `*.pawsites.co.uk` gives every
  free-tier customer a subdomain (`theirname.pawsites.co.uk`).
- Paid customers attach their own domain (e.g. `happyathomepets.co.uk`) to the
  same app via the Vercel domains API.
- `happyathomepets.co.uk` stays Marcus's own business site and becomes the
  platform's **first tenant** (seeded here as tenant #1).

## Tiers (billing handled offline for now)

- **Free (£0):** subdomain, WhatsApp/phone contact, content + pricing calculator.
- **Plus (~£5–7):** email enquiry form (routes to their inbox), custom domain,
  Google-Sheet lead log.
- Stripe self-serve billing is deliberately deferred — onboard/bill offline,
  add Stripe later as a "+£1/mo pay-by-card" convenience. In code a tenant's
  `tier` is just a field we set manually.

## Email (the bit that looked hard, but isn't)

No per-tenant DKIM/DMARC. Enquiries are sent **from one platform domain**
(`enquiries@pawsites.co.uk`) **to the tenant's inbox**, with `reply-to` set to
the customer. DKIM/DMARC is configured **once** for the platform domain. Free
tier simply doesn't enable the email form (WhatsApp only).

## Calendar (Rover-style, not Google-mirroring)

The platform **owns** availability + bookings in its own database — not a
read-only mirror of each sitter's public Google Calendar (which can't express
booking states and needs per-tenant setup). Bookings are a state machine:

- 🟢 available · 🟠 pending (new request) · 🔴 confirmed / blocked

Optional later perk: one-click "Connect Google Calendar" via a **single**
platform OAuth app — push confirmed bookings into the sitter's Google Calendar.
You do the Cloud Console work once, centrally; tenants just click authorise.

---

## Phased build

- **Phase 1 — Multi-tenant foundation (this repo, mostly done):**
  tenant data model, hostname middleware, data-driven components, per-tenant
  pricing, tenant-aware enquiry + native calendar API. happyathomepets seeded
  as tenant #1, pawsandstay as a free-tier demo tenant.
- **Phase 2 — Database:** move tenants from the in-code seed to Supabase
  Postgres (schema in `supabase/migrations/0001_init.sql`).
- **Phase 3 — Admin portal (CMS):** sitter login + dashboard to edit copy,
  upload photos, build pricing, manage availability/bookings.
- **Phase 4 — Custom domains:** Vercel domains API + guided "point your domain".
- **Phase 5 — Polish & scale:** onboarding wizard, Google Calendar sync,
  optional Stripe tier, then additional verticals as new base domains.

See `SETUP.md` for the accounts/DNS steps that need a human, and `README.md`
for local development.

## Current status (Phase 1)

Done: tenant model + two seed tenants, hostname resolution (middleware +
server accessor), per-tenant pricing calculator with adaptive option cards and
tier-gated enquiry (free = WhatsApp only / plus = email + WhatsApp), dual lead
capture (email + Google Sheet) reused from the happyathomepets fix, native
calendar model/API/UI. Compiles clean (`tsc --noEmit`).

Needs human input next: create the Supabase project, buy/point `pawsites.co.uk`
+ wildcard DNS on Vercel, set up the platform Resend sending domain, decide
admin-portal scope. Then Phase 2 (DB) and Phase 3 (admin) can proceed.
