-- Stores each user's color label names so they follow the account across devices.
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  color_labels jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "own prefs select" on public.user_preferences;
drop policy if exists "own prefs insert" on public.user_preferences;
drop policy if exists "own prefs update" on public.user_preferences;

create policy "own prefs select" on public.user_preferences for select using (auth.uid() = user_id);
create policy "own prefs insert" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "own prefs update" on public.user_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
