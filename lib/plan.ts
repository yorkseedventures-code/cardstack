import type { SupabaseClient } from "@supabase/supabase-js";

// Free plan monthly scan limit, and emails that bypass it with unlimited scans.

import { FREE_SCANS_PER_MONTH, PRICING, PASS_SCAN_CAP, MONTHLY_SCAN_CAP, MINI_SCANS } from "./pricing";

export const FREE_MONTHLY_SCAN_LIMIT = FREE_SCANS_PER_MONTH;

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

// The active paid entitlement (if any), with its scan cap and the start of its counting window.
// Pass: window is the pass length ending at current_period_end. Monthly: the 30 days before it.
export async function getActiveEntitlement(
  supabase: SupabaseClient,
  userId: string
): Promise<{ plan: string; cap: number; windowStartISO: string } | null> {
  const { data, error } = await supabase
    .from("entitlements")
    .select("plan, current_period_end")
    .eq("user_id", userId)
    .in("plan", ["pass", "monthly"])
    .eq("status", "active")
    .gt("current_period_end", new Date().toISOString())
    .order("current_period_end", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Entitlement lookup failed:", error);
    return null; // fail closed: treated as a free user if we can't verify
  }
  const row = data?.[0];
  if (!row) return null;

  const isMonthly = row.plan === "monthly";
  const windowDays = isMonthly ? 30 : PRICING.pass.durationDays;
  const end = new Date(row.current_period_end).getTime();
  return {
    plan: row.plan,
    cap: isMonthly ? MONTHLY_SCAN_CAP : PASS_SCAN_CAP,
    windowStartISO: new Date(end - windowDays * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// How many scans this person may make right now, and since when scans are counted.
// = base allowance (free monthly limit, or Event Pass / Monthly cap) + MINI_SCANS for each active Mini Pass.
export async function getScanAllowance(
  supabase: SupabaseClient,
  userId: string
): Promise<{ cap: number; windowStartISO: string; basePlan: "pass" | "monthly" | null; hasMini: boolean }> {
  const base = await getActiveEntitlement(supabase, userId);
  const baseCap = base ? base.cap : FREE_MONTHLY_SCAN_LIMIT;
  const baseWindow = base ? base.windowStartISO : startOfCurrentMonthISO();

  const { data: minis, error } = await supabase
    .from("entitlements")
    .select("created_at")
    .eq("user_id", userId)
    .eq("plan", "mini")
    .eq("status", "active")
    .gt("current_period_end", new Date().toISOString())
    .order("created_at", { ascending: true });

  if (error) console.error("Mini Pass lookup failed:", error); // fail closed: counts as no Mini Pass
  const list = error ? [] : minis ?? [];

  const earliest = list[0]?.created_at ? new Date(list[0].created_at) : null;
  const windowStartISO = earliest && earliest < new Date(baseWindow) ? earliest.toISOString() : baseWindow;

  return {
    cap: baseCap + list.length * MINI_SCANS,
    windowStartISO,
    basePlan: base ? (base.plan as "pass" | "monthly") : null,
    hasMini: list.length > 0,
  };
}

export function startOfCurrentMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}
