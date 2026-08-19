-- KoiCard: billing / entitlements tracking (Stripe-backed plans)
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste → Run

create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  plan text not null,                    -- 'pass' (Event Pass, 4 days, one-time) | 'monthly' (subscription)
  status text not null default 'active', -- 'active' | 'canceled' | 'expired'
  stripe_customer_id text,
  stripe_subscription_id text,           -- set for 'monthly', null for 'pass'
  stripe_session_id text,                -- checkout session that created this row (idempotency)
  current_period_end timestamptz not null, -- when this entitlement stops granting unlimited scans
  created_at timestamptz default now()
);

-- Speeds up "does this user have an active, unexpired entitlement right now" (checked on every scan)
create index if not exists entitlements_user_active_idx
  on entitlements (user_id, status, current_period_end desc);

-- Webhook lookups by Stripe subscription id (to update/cancel on renewal or cancellation events)
create index if not exists entitlements_stripe_subscription_idx
  on entitlements (stripe_subscription_id);

alter table entitlements enable row level security;

-- Users can read their own entitlements (e.g. to show "Pro until <date>" in Settings).
-- Only the server (service role, via webhook/checkout routes) can insert/update/delete —
-- there's intentionally no "for all" policy here, since a user granting themselves
-- unlimited scans by writing this table directly would defeat the whole point.
drop policy if exists "Users can view their own entitlements" on entitlements;
create policy "Users can view their own entitlements"
  on entitlements for select
  using (auth.uid() = user_id);
