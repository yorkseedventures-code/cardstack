import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { getSignedCardImageUrl } from "@/lib/cardImageStorage";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll(cs: { name: string; value: string; options: CookieOptions }[]) { try { cs.forEach(({name,value,options}) => cookieStore.set(name,value,options)); } catch {} } },
  });
}
function getIP(req: NextRequest) { return req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"; }

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed } = rateLimit(getIP(req), 60);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("contacts").select("card_image_path, card_image").eq("id", params.id).eq("user_id", user.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data?.card_image_path) {
    try { return NextResponse.json({ card_image: await getSignedCardImageUrl(supabase, data.card_image_path) }); }
    catch (e) { console.error("Signed image URL failed", e); }
  }
  return NextResponse.json({ card_image: data?.card_image || "" });
}
