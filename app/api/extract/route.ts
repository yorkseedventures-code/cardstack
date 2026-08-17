import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  try {
    const { base64, mediaType } = await req.json();
    if (!base64 || !mediaType) return NextResponse.json({ error: "Missing image" }, { status: 400 });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
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
