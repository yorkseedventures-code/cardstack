import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

const EVENT_PASS_DAYS = 4;

// Public: check whether a gift code is valid/unredeemed, without needing auth.
// Used by the /gift/[code] claim page to show the right message before login.
export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const admin = createAdminClient();
  const { data: gift, error } = await admin
    .from("gifts")
    .select("code, plan, redeemed, to_email")
    .eq("code", params.code)
    .single();

  if (error || !gift) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  return NextResponse.json({
    found: true,
    plan: gift.plan,
    redeemed: gift.redeemed,
    to_email: gift.to_email,
  });
}

// Authenticated: claim a gift and activate the pass on the signed-in user's account.
export async function POST(_req: NextRequest, { params }: { params: { code: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: gift, error: fetchError } = await admin
    .from("gifts")
    .select("*")
    .eq("code", params.code)
    .single();

  if (fetchError || !gift) {
    return NextResponse.json({ error: "Gift code not found" }, { status: 404 });
  }
  if (gift.redeemed) {
    return NextResponse.json({ error: "This gift has already been claimed" }, { status: 410 });
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("event_pass_expires_at")
    .eq("user_id", user.id)
    .single();

  const now = new Date();
  const currentExpiry = existingProfile?.event_pass_expires_at
    ? new Date(existingProfile.event_pass_expires_at)
    : null;
  // If they already have time left on an Event Pass, extend from that; otherwise start from now.
  const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(base.getTime() + EVENT_PASS_DAYS * 24 * 60 * 60 * 1000);

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ user_id: user.id, plan: "event", event_pass_expires_at: newExpiry.toISOString(), updated_at: now.toISOString() });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: redeemError } = await admin
    .from("gifts")
    .update({ redeemed: true, redeemed_by: user.id, redeemed_at: now.toISOString() })
    .eq("code", params.code);

  if (redeemError) {
    return NextResponse.json({ error: redeemError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, event_pass_expires_at: newExpiry.toISOString() });
}
