import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { base64, mediaType } = await req.json();

    if (!base64 || !mediaType) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${base64}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: `Extract all contact information from this business card image.
Return ONLY a valid JSON object with these exact keys (use empty string "" if not found):
{
  "first_name": "",
  "last_name": "",
  "title": "",
  "company": "",
  "email": "",
  "phone": "",
  "website": "",
  "linkedin": ""
}
No markdown fences, no explanation, just the raw JSON object.`,
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Extraction error:", err);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
