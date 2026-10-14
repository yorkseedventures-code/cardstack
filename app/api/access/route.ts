import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { rateLimit } from "@/lib/rate-limit";

// Signed-in user's current access-code window (if any), so Settings can show "Delegate access until ...".
export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("access_redemptions")
    .select("starts_at, ends_at, scan_cap")
    .eq("user_id", user.id)
    .gt("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: false })
    .limit(1);
  const row = data?.[0];
  return NextResponse.json({ access: row ? { starts_at: row.starts_at, ends_at: row.ends_at, scans: row.scan_cap } : null });
}

// Redeem an access code. Everyone with the code gets the same fixed window and scan cap.
export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`user:access:${user.id}`, 8, 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many tries, wait a minute and try again" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase().slice(0, 64) : "";
  if (!code) return NextResponse.json({ error: "Enter your access code" }, { status: 400 });

  const admin = createAdminClient();
  const { data: row } = await admin.from("access_codes").select("*").eq("code", code).maybeSingle();
  // Same message for unknown and switched-off codes, so codes can't be guessed one by one.
  if (!row || !row.active) return NextResponse.json({ error: "That code isn't valid" }, { status: 404 });
  if (new Date(row.ends_at).getTime() <= Date.now()) return NextResponse.json({ error: "This access has ended" }, { status: 410 });

  const payload = { starts_at: row.starts_at, expires_at: row.ends_at, scans: row.scan_cap };

  const { data: mine } = await admin.from("access_redemptions").select("id").eq("code", code).eq("user_id", user.id).maybeSingle();
  if (mine) return NextResponse.json({ success: true, already: true, ...payload });

  const { count } = await admin.from("access_redemptions").select("id", { count: "exact", head: true }).eq("code", code);
  if ((count ?? 0) >= row.max_redemptions) {
    return NextResponse.json({ error: "This code has reached its limit. Please contact the organiser." }, { status: 409 });
  }

  const { error } = await admin.from("access_redemptions").insert({
    code, user_id: user.id, starts_at: row.starts_at, ends_at: row.ends_at, scan_cap: row.scan_cap,
  });
  if (error && error.code !== "23505") return NextResponse.json({ error: "Couldn't activate the code, please try again" }, { status: 500 });

  return NextResponse.json({ success: true, ...payload });
}
