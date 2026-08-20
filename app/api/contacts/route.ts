import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeContact, sanitizeContactPartial } from "@/lib/sanitize";
import { dataUrlToBuffer, optimizeCardImage } from "@/lib/imageOptimize";
import { cardImagePath, deleteCardImage, uploadCardImage } from "@/lib/cardImageStorage";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
}

function getIP(req: NextRequest) { return req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"; }
const LIST_FIELDS = "id, user_id, first_name, last_name, title, company, email, phone, phone2, website, linkedin, instagram, x_handle, address, event, follow_up, notes, added, color, urgent, created_at, card_image_path, image_migrated_at";

export async function GET(req: NextRequest) {
  const { allowed } = rateLimit(getIP(req), 60);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("contacts").select(LIST_FIELDS).eq("user_id", user.id).order("created_at", { ascending: false });
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
  const imageData = typeof body.card_image === "string" ? body.card_image : "";
  const contact = sanitizeContact(body);
  const { data, error } = await supabase.from("contacts").insert({ ...contact, user_id: user.id }).select(LIST_FIELDS).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (imageData) {
    let uploadedPath: string | null = null;
    try {
      const path = cardImagePath(user.id, data.id);
      const optimized = await optimizeCardImage(dataUrlToBuffer(imageData));
      await uploadCardImage(supabase, path, optimized);
      uploadedPath = path;
      const migratedAt = new Date().toISOString();
      const { error: updateError } = await supabase.from("contacts").update({ card_image_path: path, image_migrated_at: migratedAt, card_image: null }).eq("id", data.id).eq("user_id", user.id);
      if (updateError) throw updateError;
      data.card_image_path = path;
      data.image_migrated_at = migratedAt;
    } catch (e) {
      console.error("Card image upload failed; contact was saved without image", e);
      // If the object made it to Storage but the DB row was never pointed at it,
      // it's an orphan (never referenced, never billed against the user visibly).
      // Best-effort clean it up rather than leaving it to accumulate.
      if (uploadedPath) {
        try { await deleteCardImage(supabase, uploadedPath); }
        catch (cleanupErr) { console.error("Failed to clean up orphaned card image", cleanupErr); }
      }
      (data as typeof data & { image_error?: boolean }).image_error = true;
    }
  }
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
  const imageData = typeof rest.card_image === "string" ? rest.card_image : "";
  const updates = sanitizeContactPartial(rest);
  if (Object.keys(updates).length === 0 && !imageData) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  if (Object.keys(updates).length) {
    const { error } = await supabase.from("contacts").update(updates).eq("id", id).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (imageData) {
    let uploadedPath: string | null = null;
    try {
      const path = cardImagePath(user.id, id);
      const optimized = await optimizeCardImage(dataUrlToBuffer(imageData));
      await uploadCardImage(supabase, path, optimized);
      uploadedPath = path;
      const { error } = await supabase.from("contacts").update({ card_image_path: path, image_migrated_at: new Date().toISOString(), card_image: null }).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
    } catch (e) {
      if (uploadedPath) {
        try { await deleteCardImage(supabase, uploadedPath); }
        catch (cleanupErr) { console.error("Failed to clean up orphaned card image", cleanupErr); }
      }
      return NextResponse.json({ error: e instanceof Error ? e.message : "Image upload failed" }, { status: 500 });
    }
  }
  const { data, error } = await supabase.from("contacts").select(LIST_FIELDS).eq("id", id).eq("user_id", user.id).single();
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
  const { data: existing } = await supabase.from("contacts").select("card_image_path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (existing?.card_image_path) {
    try { await deleteCardImage(supabase, existing.card_image_path); }
    catch (e) { console.error("Failed to remove card image", e); return NextResponse.json({ error: "Could not delete card image" }, { status: 500 }); }
  }
  const { error } = await supabase.from("contacts").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
