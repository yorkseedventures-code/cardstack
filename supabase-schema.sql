-- KoiCard / CardStack: contacts table + RLS policies
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste → Run

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  first_name text default '',
  last_name text default '',
  title text default '',
  company text default '',
  email text default '',
  phone text default '',
  phone2 text default '',
  website text default '',
  linkedin text default '',
  event text default '',
  follow_up text default '',
  notes text default '',
  added text default '',
  color text default 'grey',
  created_at timestamptz default now()
);

-- Speeds up "WHERE user_id = ... ORDER BY created_at DESC" (used on every load)
create index if not exists contacts_user_id_created_at_idx
  on contacts (user_id, created_at desc);

alter table contacts enable row level security;

-- Each user can only see/insert/update/delete their own contacts
drop policy if exists "Users can manage their own contacts" on contacts;
create policy "Users can manage their own contacts"
  on contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
