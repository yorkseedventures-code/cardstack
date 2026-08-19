import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getStripe, getPriceId, PlanId } from "@/lib/stripe";

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

// POST { plan: "pass" | "monthly" } -> { url: string }
// Creates a Stripe Checkout session for the signed-in user and returns the URL
// to redirect them to. The actual entitlement is granted by the webhook once
// Stripe confirms payment — never trust the client-side redirect back alone.
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let plan: PlanId;
  try {
    const body = await req.json();
    if (body.plan !== "pass" && body.plan !== "monthly") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    plan = body.plan;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return NextResponse.json({ error: "Server misconfigured: NEXT_PUBLIC_SITE_URL not set" }, { status: 500 });

  try {
    const stripe = getStripe();
    const priceId = getPriceId(plan);

    const session = await stripe.checkout.sessions.create({
      mode: plan === "monthly" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan },
      subscription_data: plan === "monthly" ? { metadata: { user_id: user.id, plan } } : undefined,
      success_url: `${siteUrl}/?upgraded=1`,
      cancel_url: `${siteUrl}/?upgrade_canceled=1`,
    });

    if (!session.url) return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 });
  }
}
