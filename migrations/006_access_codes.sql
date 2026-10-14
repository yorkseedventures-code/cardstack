-- Access codes: a shared code (for a delegation, event or partner) that gives everyone who enters it a fixed window of scanning.
-- Run this once in the Supabase SQL editor. To make another code, insert another row into access_codes.

create table if not exists access_codes (
  code text primary key,                 -- stored UPPERCASE; people can type it in any case
  label text,                            -- your own note, e.g. 'Yorkseed Lisbon delegation'
  starts_at timestamptz not null,        -- access begins here (everyone gets the same window)
  ends_at timestamptz not null,          -- access ends here
  scan_cap integer not null default 300, -- scans per person during the window
  max_redemptions integer not null default 150,
  active boolean not null default true,  -- set to false to stop new people redeeming
  created_at timestamptz default now()
);

create table if not exists access_redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null references access_codes(code),
  user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  scan_cap integer not null,
  created_at timestamptz default now(),
  unique (code, user_id)
);
create index if not exists access_redemptions_user_idx on access_redemptions (user_id, ends_at desc);

alter table access_codes enable row level security;
-- No policies on purpose: codes are only read by the server (service role), so nobody can list them.

alter table access_redemptions enable row level security;
drop policy if exists "Users can view their own access" on access_redemptions;
create policy "Users can view their own access" on access_redemptions for select using (auth.uid() = user_id);

-- Yorkseed Lisbon delegation: 2 weeks, 300 scans each, starting 5 November 2026 (ends the end of 18 November, UTC).
insert into access_codes (code, label, starts_at, ends_at, scan_cap, max_redemptions)
values ('YS-LISBON-NOV26', 'Yorkseed Lisbon delegation', '2026-11-05T00:00:00Z', '2026-11-19T00:00:00Z', 300, 150)
on conflict (code) do nothing;
