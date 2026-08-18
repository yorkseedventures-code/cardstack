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
    const { base64, mediaType, qrText } = await req.json();
    if (!base64 || !mediaType) return NextResponse.json({ error: "Missing image" }, { status: 400 });

    const qrNote = qrText
      ? ` This card also has a QR code, already decoded (client-side) to this raw text: ${JSON.stringify(qrText)}. Note that vision models cannot reliably decode QR codes visually — this text was extracted separately and is exact. If the card's only content is the QR code (nothing else visible), use this decoded text to fill in whatever fields it implies (e.g. a name, phone, email, or URL) instead of leaving everything blank. If it's a plain URL and no other field points elsewhere, put it in "website" (or "linkedin" if it's a linkedin.com URL).`
      : "";

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mediaType};base64,${base64}`, detail: "high" } },
          { type: "text", text: `Extract contact info from this business card. Return ONLY valid JSON with these keys (empty string if not found): {"first_name":"","last_name":"","title":"","company":"","email":"","phone":"","phone2":"","website":"","linkedin":""}. For "phone", always include the country calling code (e.g. "+1", "+44"). If the card doesn't show one explicitly but shows a country/address that implies one, infer it from that. Format as "+<code> <rest of number>". If the card lists a second, separate phone number (e.g. a mobile and an office line), put it in "phone2" using the same format; otherwise leave "phone2" as an empty string.${qrNote}` }
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
