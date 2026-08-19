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
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) {
    console.error("GET /api/contacts - no user. authError:", authError?.message, "cookies present:", cookies().getAll().map(c => c.name));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) {
    console.error("POST /api/contacts - no user. authError:", authError?.message, "cookies present:", cookies().getAll().map(c => c.name));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contact = await req.json();
  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...contact, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
