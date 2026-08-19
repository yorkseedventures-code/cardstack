-- KoiCard: add missing card_image column
-- The app has been sending the scanned card photo on save, but the contacts
-- table never had a column for it, so it was silently dropped on every save.
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste → Run

alter table contacts add column if not exists card_image text;
