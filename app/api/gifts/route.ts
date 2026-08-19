import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Creates a gift record after a successful payment.
// TODO: once Stripe is wired up, call this from the Stripe webhook handler
// (on checkout.session.completed for the Event Pass gift product) instead of
// from any client code, and email the resulting claim link to `to_email`.
//
// Locked down with a shared secret so it can't be hit directly from the
// browser to mint free passes. Set GIFT_WEBHOOK_SECRET in Vercel env vars,
// and send it as `Authorization: Bearer <secret>` from whatever calls this
// (e.g. the Stripe webhook handler, using the secret from its own env var).
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.GIFT_WEBHOOK_SECRET}`;
  if (!process.env.GIFT_WEBHOOK_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { from_email, to_email } = await req.json().catch(() => ({}));
  if (!from_email || !to_email) {
    return NextResponse.json({ error: "from_email and to_email are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("gifts")
    .insert({ from_email, to_email, plan: "event" })
    .select("code")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: data.code, claim_url: `/gift/${data.code}` });
}
