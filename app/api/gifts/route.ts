import { NextResponse } from "next/server";

// Gifts are created by the Stripe webhook after a successful payment (see /api/billing/webhook).
// This endpoint used to mint gifts directly; it is intentionally disabled.
export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
