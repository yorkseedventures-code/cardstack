INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-images',
  'card-images',
  false,
  1048576,
  ARRAY['image/jpeg']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/jpeg']::text[];

DROP POLICY IF EXISTS "card images select own" ON storage.objects;
CREATE POLICY "card images select own" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'card-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "card images insert own" ON storage.objects;
CREATE POLICY "card images insert own" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'card-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "card images update own" ON storage.objects;
CREATE POLICY "card images update own" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'card-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'card-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "card images delete own" ON storage.objects;
CREATE POLICY "card images delete own" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'card-images' AND (storage.foldername(name))[1] = auth.uid()::text);
