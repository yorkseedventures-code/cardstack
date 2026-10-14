-- Prevent duplicate entitlements if Stripe retries a webhook for the same checkout session.
-- Run in Supabase: Dashboard > SQL Editor > New query > paste > Run
create unique index if not exists entitlements_stripe_session_unique
  on entitlements (stripe_session_id)
  where stripe_session_id is not null;
