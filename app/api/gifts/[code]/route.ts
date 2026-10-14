import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { PRICING, PASS_DURATION_MS } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";

function getIP(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// Public: is this gift code valid and unclaimed? Used by the /gift/[code] page before login.
// Deliberately returns nothing about who bought it.
export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const { allowed } = rateLimit(`ip:gift:${getIP(req)}`, 60, 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const admin = createAdminClient();
  const { data: gift } = await admin.from("gifts").select("redeemed").eq("code", params.code).maybeSingle();
  if (!gift) return NextResponse.json({ found: false }, { status: 404 });
  return NextResponse.json({ found: true, redeemed: gift.redeemed });
}

// Authenticated: claim a gift. Grants a normal Event Pass entitlement (same cap and length as a purchased one).
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`user:gift:${user.id}`, 10, 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const admin = createAdminClient();
  const now = new Date();

  // Claim atomically: only the first caller flips redeemed from false to true.
  const { data: claimed, error: claimError } = await admin
    .from("gifts")
    .update({ redeemed: true, redeemed_by: user.id, redeemed_at: now.toISOString() })
    .eq("code", params.code)
    .eq("redeemed", false)
    .select("code")
    .maybeSingle();

  if (claimError) return NextResponse.json({ error: "Couldn't claim this gift" }, { status: 500 });
  if (!claimed) {
    const { data: exists } = await admin.from("gifts").select("redeemed").eq("code", params.code).maybeSingle();
    if (!exists) return NextResponse.json({ error: "Gift code not found" }, { status: 404 });
    return NextResponse.json({ error: "This gift has already been claimed" }, { status: 410 });
  }

  const expires = new Date(now.getTime() + PASS_DURATION_MS);
  const { error: grantError } = await admin.from("entitlements").insert({
    user_id: user.id,
    plan: "pass",
    status: "active",
    stripe_session_id: `gift_${params.code}`,
    current_period_end: expires.toISOString(),
  });

  if (grantError) {
    // Put the gift back so the recipient can try again instead of losing it.
    await admin.from("gifts").update({ redeemed: false, redeemed_by: null, redeemed_at: null }).eq("code", params.code);
    return NextResponse.json({ error: "Couldn't activate the pass, please try again" }, { status: 500 });
  }

  return NextResponse.json({ success: true, expires_at: expires.toISOString(), scans: PRICING.pass.scanCap });
}
