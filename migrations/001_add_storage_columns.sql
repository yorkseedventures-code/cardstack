ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS card_image_path text,
  ADD COLUMN IF NOT EXISTS image_migrated_at timestamptz;

CREATE INDEX IF NOT EXISTS contacts_unmigrated_images_idx
  ON public.contacts (id)
  WHERE card_image IS NOT NULL
    AND card_image <> ''
    AND card_image_path IS NULL;
