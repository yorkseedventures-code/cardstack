import { NextRequest, NextResponse } from "next/server";
import { Contact } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { contact, webhookUrl } = await req.json() as { contact: Contact; webhookUrl: string };

    if (!webhookUrl) {
      return NextResponse.json({ error: "No webhook URL configured" }, { status: 400 });
    }

    const row = {
      first_name: contact.first_name,
      last_name: contact.last_name,
      title: contact.title,
      company: contact.company,
      email: contact.email,
      phone: contact.phone,
      website: contact.website,
      linkedin: contact.linkedin,
      event: contact.event,
      follow_up: contact.follow_up,
      notes: contact.notes,
      added: contact.added,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
