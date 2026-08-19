import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeContact, sanitizeContactPartial } from "@/lib/sanitize";

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

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
}

export async function GET(req: NextRequest) {
  const { allowed } = rateLimit(getIP(req), 60);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Deliberately exclude card_image here: it's a base64 photo (~250-300KB each)
  // and this list query runs on every page load/retry/background refresh. Pulling
  // it for every contact just to render a scrollable list burns through Supabase's
  // egress quota fast. The image is fetched on demand instead, via
  // GET /api/contacts/[id]/image, only when a contact card is actually expanded.
  const { data, error } = await supabase
    .from("contacts")
    .select("id, user_id, first_name, last_name, title, company, email, phone, phone2, website, linkedin, instagram, x_handle, address, event, follow_up, notes, added, color, urgent, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getIP(req), 30);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const contact = sanitizeContact(body);

  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...contact, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { allowed } = rateLimit(getIP(req), 30);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id || typeof id !== "string") return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const updates = sanitizeContactPartial(rest);
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

  const { data, error } = await supabase
    .from("contacts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { allowed } = rateLimit(getIP(req), 30);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id || typeof id !== "string") return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
