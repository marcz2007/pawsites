-- Pawsites — initial schema (Phase 2).
-- Mirrors lib/tenant/types.ts. Rich content blocks are stored as JSONB so the
-- admin portal can edit them without migrations; structured/queried fields are
-- columns. Run in the Supabase SQL editor or via the Supabase CLI.

create table if not exists tenants (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  status        text not null default 'draft' check (status in ('active','draft')),
  tier          text not null default 'free'  check (tier in ('free','plus')),

  business_name text not null,
  founder_name  text,
  tagline       text not null default '',
  location_label text not null default '',

  -- branding
  primary_color text not null default 'oklch(0.55 0.13 152)',
  logo_src      text,

  -- contact
  contact_email text,
  contact_phone text,
  whatsapp      text,           -- digits only, no '+'
  response_time text,

  -- enquiry routing
  enquiry_to_email     text,
  enquiry_sheet_webhook text,

  -- rich content blocks (hero, about, reviews, faqs, seo, service_areas)
  hero          jsonb not null default '{}'::jsonb,
  about         jsonb not null default '{}'::jsonb,
  reviews       jsonb not null default '{}'::jsonb,
  faqs          jsonb not null default '[]'::jsonb,
  service_areas jsonb not null default '[]'::jsonb,
  seo           jsonb not null default '{}'::jsonb,

  -- pricing config (PricingConfig)
  pricing       jsonb not null default '{}'::jsonb,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Custom domains pointed at a tenant (paid-tier "bring your own domain").
create table if not exists tenant_domains (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  hostname   text unique not null,        -- e.g. 'happyathomepets.co.uk'
  created_at timestamptz not null default now()
);

-- Native calendar: availability is "available unless a booking says otherwise".
create table if not exists bookings (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  start_date date not null,
  end_date   date not null,               -- exclusive (checkout day)
  status     text not null check (status in ('pending','confirmed','blocked')),
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists bookings_tenant_idx on bookings(tenant_id, start_date);
create index if not exists tenant_domains_hostname_idx on tenant_domains(hostname);
