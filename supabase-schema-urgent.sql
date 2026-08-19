-- KoiCard: add a manual "urgent" flag to contacts, separate from the
-- follow-up-date-based urgency check. Run in Supabase SQL Editor.

alter table contacts add column if not exists urgent boolean default false;
NOTIFY pgrst, 'reload schema';
