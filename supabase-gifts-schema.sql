-- KoiCard: gift Event Passes + user plan state
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste → Run

-- Tracks each purchased gift and whether it's been claimed yet.
-- Rows are only ever created/read/updated via server-side API routes using
-- the service role key, so RLS is left locked down (no direct client access).
create table if not exists gifts (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default replace(gen_random_uuid()::text, '-', ''),
  plan text not null default 'event',
  from_email text not null,
  to_email text not null,
  redeemed boolean not null default false,
  redeemed_by uuid references auth.users(id),
  redeemed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists gifts_code_idx on gifts (code);

alter table gifts enable row level security;
-- No policies: table is only accessed via API routes using the service role key,
-- which bypasses RLS. This keeps gift codes from being readable/writable directly
-- by any signed-in client.

-- Tracks each user's current plan and, for Event Pass, when it expires.
create table if not exists profiles (
  user_id uuid primary key references auth.users(id),
  plan text not null default 'free',
  event_pass_expires_at timestamptz,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can view their own profile" on profiles;
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = user_id);

-- Inserts/updates to profiles happen via API routes using the service role key
-- (e.g. on gift redemption), so no client-side write policy is needed yet.
