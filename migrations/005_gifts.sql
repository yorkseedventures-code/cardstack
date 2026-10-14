-- Gifts: a buyer pays for an Event Pass, gets a claim link, and anyone who opens it while signed in can redeem it once.
create table if not exists gifts (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default replace(gen_random_uuid()::text, '-', ''),
  plan text not null default 'pass',
  from_email text,
  to_email text,
  redeemed boolean not null default false,
  redeemed_by uuid references auth.users(id),
  redeemed_at timestamptz,
  created_at timestamptz default now()
);

alter table gifts alter column from_email drop not null;
alter table gifts alter column to_email drop not null;
alter table gifts add column if not exists buyer_id uuid references auth.users(id);
alter table gifts add column if not exists stripe_session_id text;

create unique index if not exists gifts_stripe_session_unique on gifts (stripe_session_id) where stripe_session_id is not null;
create index if not exists gifts_code_idx on gifts (code);

alter table gifts enable row level security;
-- No policies on purpose: gifts are only read and written by server routes using the service role key.
