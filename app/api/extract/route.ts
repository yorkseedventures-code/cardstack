import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { SUPPORT_EMAIL } from "@/lib/pricing";
import { FREE_MONTHLY_SCAN_LIMIT, hasUnlimitedScans, getScanAllowance } from "@/lib/plan";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

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

async function findLinkedIn(name: string, company: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;
    if (!apiKey || !cseId) return "";
    const query = `site:linkedin.com/in ${name} ${company}`.trim();
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=3`;
    const res = await fetch(url);
    const data = await res.json();
    const item = data.items?.find((i: any) => i.link?.includes("linkedin.com/in/"));
    return item?.link || "";
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  // Loose per-IP backstop against abuse. Many people can share one IP (conference Wi-Fi, offices),
  // so the real limit below is per signed-in user.
  const { allowed: ipAllowed } = rateLimit(`ip:scan:${getIP(req)}`, 300, 60_000);
  if (!ipAllowed) return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Per-user limit: 10 scans a minute each, regardless of who else is on the same network.
  const { allowed: userAllowed } = rateLimit(`user:scan:${user.id}`, 10, 60_000);
  if (!userAllowed) return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });

  if (!hasUnlimitedScans(user.email)) {
    const { cap, windowStartISO, basePlan, hasMini } = await getScanAllowance(supabase, user.id);

    const { count, error: countError } = await supabase
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", windowStartISO);

    if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });

    if ((count ?? 0) >= cap) {
      if (basePlan) {
        const what = basePlan === "monthly" ? "this month" : basePlan === "delegate" ? "with your access code" : "with your Event Pass";
        return NextResponse.json(
          { error: `You've used all ${cap} scans included ${what}. Get a Mini Pass for more, or contact ${SUPPORT_EMAIL}.`, capReached: basePlan },
          { status: 403 }
        );
      }
      const msg = hasMini
        ? `You've used all ${cap} scans, including your Mini Pass. Get another to keep scanning.`
        : `You've hit your ${FREE_MONTHLY_SCAN_LIMIT} free scans this month. Upgrade to keep scanning.`;
      return NextResponse.json({ error: msg, limitReached: true }, { status: 403 });
    }
  }

  // Record the scan up front so a failure to save it can never give away free scans.
  // If the extraction itself fails below, the record is removed again so nobody is charged a scan.
  const { data: scanRow, error: scanError } = await supabase
    .from("scans")
    .insert({ user_id: user.id })
    .select("id")
    .single();
  if (scanError || !scanRow) {
    console.error("Could not record scan:", scanError);
    return NextResponse.json({ error: "Could not record scan, please try again" }, { status: 500 });
  }
  const refundScan = async () => { await supabase.from("scans").delete().eq("id", scanRow.id); };

  try {
    const { base64, mediaType } = await req.json();

    if (!base64 || !mediaType) { await refundScan(); return NextResponse.json({ error: "Missing image" }, { status: 400 }); }
    if (!["image/jpeg", "image/png", "image/webp"].includes(mediaType)) {
      { await refundScan(); return NextResponse.json({ error: "Invalid image type" }, { status: 400 }); }
    }
    if (base64.length > 10_000_000) {
      { await refundScan(); return NextResponse.json({ error: "Image too large" }, { status: 400 }); }
    }

    const response = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mediaType};base64,${base64}`, detail: "high" } },
          { type: "text", text: `Extract all contact information from this business card image. Return ONLY valid JSON with these exact keys (use empty string if not found): {"first_name":"","last_name":"","title":"","company":"","email":"","phone":"","phone2":"","website":"","linkedin":"","instagram":"","x_handle":"","address":""}.

Rules:
- linkedin: capture the COMPLETE linkedin URL or handle - include every single character, do not truncate. If it starts with linkedin.com/in/ include the full path.
- address: capture ANY lines that form a postal address including street number, street name, floor, suite, city, state or province, postal code, country. Include even if there is no "Address:" label. Examples of unlabeled addresses on cards: "123 Main St, New York, NY 10001" or "Level 4, 10 Bridge St, Sydney NSW 2000" or "Suite 500, 1 King St W, Toronto ON M5H 1A1". Join multiple address lines with a comma. If you see a number followed by a street name anywhere on the card, treat it as an address.
- instagram: handle starting with @ or URL containing instagram.com
- x_handle: handle starting with @ or URL containing x.com or twitter.com
- phone2: second phone number if a second one is present
- title: capture the COMPLETE job title, do not truncate
- email: capture the COMPLETE email address, do not truncate
- All other fields: extract normally from the card, never truncate any value

No markdown, no explanation, just the raw JSON object.` }
        ]
      }]
    });

    const text = response.choices[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    if (!data.linkedin && (data.first_name || data.last_name)) {
      const fullName = `${data.first_name} ${data.last_name}`.trim();
      data.linkedin = await findLinkedIn(fullName, data.company || "");
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Extraction error:", err);
    await refundScan();
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
