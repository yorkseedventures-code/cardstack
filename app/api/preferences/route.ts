import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
}

export async function GET() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_preferences")
    .select("color_labels")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ color_labels: data?.color_labels || {} });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const color_labels = body?.color_labels;
  if (!color_labels || typeof color_labels !== "object" || Array.isArray(color_labels)) {
    return NextResponse.json({ error: "Invalid labels" }, { status: 400 });
  }
  // Keep only string values, trimmed and capped, for known colors.
  const clean: Record<string, string> = {};
  for (const k of ["grey", "purple", "pink", "blue", "green", "yellow", "red"]) {
    const v = color_labels[k];
    clean[k] = typeof v === "string" ? v.trim().slice(0, 40) : "";
  }

  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: user.id, color_labels: clean, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
