// Strip HTML tags and dangerous characters from user input

export function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>"'`]/g, "") // strip dangerous chars
    .trim()
    .slice(0, 500); // max 500 chars per field
}

export function sanitizeContact(contact: Record<string, unknown>) {
  const fields = [
    "first_name", "last_name", "title", "company",
    "email", "phone", "phone2", "website", "linkedin",
    "event", "follow_up", "notes", "color", "added"
  ];
  const clean: Record<string, string> = {};
  for (const field of fields) {
    clean[field] = sanitize(contact[field]);
  }
  return clean;
}
