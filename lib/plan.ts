import type { SupabaseClient } from "@supabase/supabase-js";

// Free plan monthly scan limit, and emails that bypass it with unlimited scans.

export const FREE_MONTHLY_SCAN_LIMIT = 20;

// Manual override list (e.g. team/testing accounts) — kept alongside real paid
// entitlements below, not instead of them.
export const UNLIMITED_SCAN_EMAILS = new Set([
  "jess.sophia@gmail.com",
]);

export function hasUnlimitedScans(email: string | null | undefined): boolean {
  if (!email) return false;
  return UNLIMITED_SCAN_EMAILS.has(email.toLowerCase());
}

// Checks for a real, unexpired paid entitlement (Event Pass or monthly subscription)
// granted via Stripe. This is the source of truth for "did this person actually pay."
export async function hasActiveEntitlement(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("current_period_end", new Date().toISOString())
    .limit(1);

  if (error) {
    console.error("Entitlement check failed:", error);
    return false; // fail closed: don't grant unlimited scans if we can't verify
  }
  return (data?.length ?? 0) > 0;
}

export function startOfCurrentMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}
