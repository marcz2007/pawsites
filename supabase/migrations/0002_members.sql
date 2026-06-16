-- Phase 3b — invite-only per-sitter accounts.
-- Sitter identities live in Supabase Auth (auth.users). These tables link a
-- user to the tenant(s) they may manage, and hold pending password-set invites.
-- Run in the Supabase SQL editor.

-- Which tenant(s) a user can manage. (Join table allows multi-staff / multi-site.)
create table if not exists tenant_members (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  tenant_id  uuid not null references tenants(id) on delete cascade,
  role       text not null default 'owner' check (role in ('owner','staff')),
  created_at timestamptz not null default now(),
  unique (user_id, tenant_id)
);
create index if not exists tenant_members_user_idx on tenant_members(user_id);
create index if not exists tenant_members_tenant_idx on tenant_members(tenant_id);

-- One-time tokens used so an invited sitter can set their own password.
create table if not exists sitter_invites (
  token      text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  tenant_id  uuid not null references tenants(id) on delete cascade,
  email      text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- RLS: the app accesses these with the service_role key (which bypasses RLS),
-- so these policies are defence-in-depth against the public anon key. A signed-
-- in user may read their own membership rows; nothing else is exposed.
alter table tenant_members enable row level security;
alter table sitter_invites enable row level security;

drop policy if exists "members read own" on tenant_members;
create policy "members read own"
  on tenant_members for select
  using (user_id = auth.uid());
