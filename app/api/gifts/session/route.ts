import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

// GET ?session_id=cs_... -> { code } for the signed-in buyer of that checkout session.
// The webhook may take a moment to run, so the success page polls this (404 = not ready yet).
export async function GET(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) return NextResponse.json({ error: "Invalid session" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("gifts")
    .select("code")
    .eq("stripe_session_id", sessionId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  if (!data) return NextResponse.json({ ready: false }, { status: 404 });
  return NextResponse.json({ ready: true, code: data.code });
}
