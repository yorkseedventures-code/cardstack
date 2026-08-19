// Free plan monthly scan limit, and emails that bypass it with unlimited scans.

export const FREE_MONTHLY_SCAN_LIMIT = 20;

export const UNLIMITED_SCAN_EMAILS = new Set([
  "jess.sophia@gmail.com",
]);

export function hasUnlimitedScans(email: string | null | undefined): boolean {
  if (!email) return false;
  return UNLIMITED_SCAN_EMAILS.has(email.toLowerCase());
}

export function startOfCurrentMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}
