import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { FREE_MONTHLY_SCAN_LIMIT, hasUnlimitedScans, hasActiveEntitlement, startOfCurrentMonthISO } from "@/lib/plan";

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
    const query = `${name} ${company}`.trim();
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=1`;
    const res = await fetch(url);
    const data = await res.json();
    const item = data.items?.[0];
    if (item?.link?.includes("linkedin.com/in/")) return item.link;
    return "";
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getIP(req), 10, 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });

  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasUnlimitedScans(user.email) && !(await hasActiveEntitlement(supabase, user.id))) {
    const { count, error: countError } = await supabase
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfCurrentMonthISO());

    if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });

    if ((count ?? 0) >= FREE_MONTHLY_SCAN_LIMIT) {
      return NextResponse.json(
        { error: `You've hit your ${FREE_MONTHLY_SCAN_LIMIT} free scans this month. Upgrade to keep scanning.`, limitReached: true },
        { status: 403 }
      );
    }
  }

  try {
    const { base64, mediaType } = await req.json();

    if (!base64 || !mediaType) return NextResponse.json({ error: "Missing image" }, { status: 400 });
    if (!["image/jpeg", "image/png", "image/webp"].includes(mediaType)) {
      return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
    }
    if (base64.length > 10_000_000) {
      return NextResponse.json({ error: "Image too large" }, { status: 400 });
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
- address: capture ANY lines that form a postal address including street number, street name, floor, suite, city, state or province, postal code, country. Include even if there is no "Address:" label. Join multiple address lines with a comma.
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

    await supabase.from("scans").insert({ user_id: user.id });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Extraction error:", err);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
