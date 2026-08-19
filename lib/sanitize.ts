// Strip HTML tags and dangerous characters from user input

export function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>"'`]/g, "") // strip dangerous chars
    .trim()
    .slice(0, 1000); // max 1000 chars per field (was 500, too short for long URLs)
}

function sanitizeBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

// card_image holds a base64 data URL (can be hundreds of KB), so it can't go
// through sanitize() -- that truncates to 500 chars, which would corrupt the
// image. Instead just check it looks like an image data URL and cap it at a
// generous size to prevent abuse.
const MAX_CARD_IMAGE_CHARS = 8_000_000; // ~6MB decoded, plenty for a photo
function sanitizeCardImage(value: unknown): string {
  if (typeof value !== "string") return "";
  if (!/^data:image\/(png|jpe?g|webp|gif|heic|heif)/.test(value)) return "";
  return value.slice(0, MAX_CARD_IMAGE_CHARS);
}

const TEXT_FIELDS = [
  "first_name", "last_name", "title", "company",
  "email", "phone", "phone2", "website", "linkedin",
  "instagram", "x_handle", "address",
  "event", "follow_up", "notes", "color", "added"
];

export function sanitizeContact(contact: Record<string, unknown>) {
  const clean: Record<string, string | boolean> = {};
  for (const field of TEXT_FIELDS) {
    clean[field] = sanitize(contact[field]);
  }
  clean.urgent = sanitizeBoolean(contact.urgent);
  clean.card_image = sanitizeCardImage(contact.card_image);
  return clean;
}

// Like sanitizeContact, but only includes fields that were actually
// present in the input, used for partial updates (PATCH) so that
// omitted fields aren't overwritten with empty strings.
export function sanitizeContactPartial(contact: Record<string, unknown>) {
  const clean: Record<string, string | boolean> = {};
  for (const field of TEXT_FIELDS) {
    if (field in contact) clean[field] = sanitize(contact[field]);
  }
  if ("urgent" in contact) clean.urgent = sanitizeBoolean(contact.urgent);
  if ("card_image" in contact) clean.card_image = sanitizeCardImage(contact.card_image);
  return clean;
}
