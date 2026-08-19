// Strip HTML tags and dangerous characters from user input

export function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>"'`]/g, "") // strip dangerous chars
    .trim()
    .slice(0, 500); // max 500 chars per field
}

function sanitizeBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

const TEXT_FIELDS = [
  "first_name", "last_name", "title", "company",
  "email", "phone", "phone2", "website", "linkedin",
  "event", "follow_up", "notes", "color", "added"
];

export function sanitizeContact(contact: Record<string, unknown>) {
  const clean: Record<string, string | boolean> = {};
  for (const field of TEXT_FIELDS) {
    clean[field] = sanitize(contact[field]);
  }
  clean.urgent = sanitizeBoolean(contact.urgent);
  return clean;
}

// Like sanitizeContact, but only includes fields that were actually
// present in the input — used for partial updates (PATCH) so that
// omitted fields aren't overwritten with empty strings.
export function sanitizeContactPartial(contact: Record<string, unknown>) {
  const clean: Record<string, string | boolean> = {};
  for (const field of TEXT_FIELDS) {
    if (field in contact) clean[field] = sanitize(contact[field]);
  }
  if ("urgent" in contact) clean.urgent = sanitizeBoolean(contact.urgent);
  return clean;
}
