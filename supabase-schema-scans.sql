-- KoiCard: scan usage tracking (for monthly free-plan limit) + RLS policies
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste → Run

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

-- Speeds up "WHERE user_id = ... AND created_at >= start_of_month" (used on every scan)
create index if not exists scans_user_id_created_at_idx
  on scans (user_id, created_at desc);

alter table scans enable row level security;

-- Each user can only see/insert their own scan records
drop policy if exists "Users can manage their own scans" on scans;
create policy "Users can manage their own scans"
  on scans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
