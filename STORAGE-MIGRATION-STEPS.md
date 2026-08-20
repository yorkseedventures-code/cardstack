# Storage migration deployment steps

Do these in order. Do not clear legacy images manually.

1. In Supabase SQL Editor run `migrations/001_add_storage_columns.sql`.
2. Run `migrations/002_storage_bucket_and_policies.sql`.
3. Locally run `npm install` (this installs `sharp` and refreshes `package-lock.json`). `sharp` ships prebuilt native binaries per platform — if you deploy somewhere other than Vercel/standard Linux CI, make sure `npm install` runs on the target platform (or in Docker) so the correct binary gets bundled, not copied from your local machine.
4. Deploy this application version. New scans will save one optimized JPEG in private Storage and only a path in Postgres. Existing images still display through the legacy fallback.
5. **Back up the database before the bulk migration.** In the Supabase Dashboard: Database → Backups → trigger a manual backup (or, from the CLI: `supabase db dump -f pre-storage-migration-backup.sql` using your project's connection string). Confirm the backup completed before proceeding to step 6 — this is the step that starts clearing `card_image` values, and it should not be skipped.
6. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your local shell, then run `npm run migrate:card-images` — ideally first against a duplicate/staging project, or at least watch the console output on the first batch or two before letting it run unattended.
7. Verify several old contacts display/download correctly, and confirm Storage contains `card-images/{user_id}/{contact_id}.jpg` objects.
8. Re-run `npm run migrate:card-images`; it is designed to skip already migrated rows. It should report no remaining work.
9. Verify with SQL:

```sql
select
  count(*) filter (where card_image is not null and card_image <> '') as legacy_images,
  count(*) filter (where card_image_path is not null) as storage_images
from public.contacts;
```

Expected after a complete migration: `legacy_images = 0` and `storage_images` approximately equals the number of contacts that had images.

## Important

- The migration clears each legacy Base64 value only after upload + download verification succeeds.
- The app keeps a legacy read fallback during migration.
- Deleting a migrated contact deletes its Storage image first, then its DB row.
- The list endpoint never selects `card_image`.
- Do not drop the legacy `card_image` column yet. Keep it until the migration has been verified in production.
