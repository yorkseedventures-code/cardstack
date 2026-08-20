import type { SupabaseClient } from "@supabase/supabase-js";

export const CARD_IMAGE_BUCKET = "card-images";

export function cardImagePath(userId: string, contactId: string): string {
  return `${userId}/${contactId}.jpg`;
}

export async function uploadCardImage(client: SupabaseClient, path: string, image: Buffer) {
  const { error } = await client.storage.from(CARD_IMAGE_BUCKET).upload(path, image, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw error;
}

export async function deleteCardImage(client: SupabaseClient, path: string) {
  const { error } = await client.storage.from(CARD_IMAGE_BUCKET).remove([path]);
  if (error) throw error;
}

export async function getSignedCardImageUrl(client: SupabaseClient, path: string, expiresIn = 3600) {
  const { data, error } = await client.storage.from(CARD_IMAGE_BUCKET).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
