import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

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

// Returns just the card_image for a single contact, fetched on demand (e.g. when
// a card is expanded in the UI). Kept separate from the list endpoint so the
// heavy base64 photo is only ever downloaded for the one contact actually being
// viewed, not for every contact on every list load.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed } = rateLimit(getIP(req), 60);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { id } = params;
  if (!id || typeof id !== "string") return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("contacts")
    .select("card_image")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ card_image: data?.card_image || "" });
}
