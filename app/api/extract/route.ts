import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { rateLimit } from "@/lib/rate-limit";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
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
  // Strict rate limit for AI extraction: 10 per minute per IP
  const { allowed } = rateLimit(getIP(req), 10, 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });

  try {
    const { base64, mediaType } = await req.json();

    // Validate inputs
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
          { type: "text", text: `Extract contact info from this business card. Return ONLY valid JSON with these keys (empty string if not found): {"first_name":"","last_name":"","title":"","company":"","email":"","phone":"","website":"","linkedin":""}` }
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
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
