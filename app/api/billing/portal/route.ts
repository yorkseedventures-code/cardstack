import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { SUPPORT_EMAIL } from "@/lib/pricing";

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

// POST -> { url }
// Opens Stripe's hosted customer portal so a Monthly subscriber can cancel, update their card
// and see invoices on their own. The customer id is looked up from the signed-in user's own
// entitlement rows, never taken from the request.
export async function POST() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("entitlements")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .eq("plan", "monthly")
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Couldn't look up your subscription" }, { status: 500 });
  if (!data?.stripe_customer_id) {
    return NextResponse.json({ error: `No Monthly subscription found on this account. Email ${SUPPORT_EMAIL} if you need help.` }, { status: 404 });
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koicard.app";
    const session = await getStripe().billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${siteUrl}/`,
      ...(process.env.STRIPE_PORTAL_CONFIG ? { configuration: process.env.STRIPE_PORTAL_CONFIG } : {}),
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Portal session failed:", e);
    return NextResponse.json({ error: `Couldn't open billing. Email ${SUPPORT_EMAIL} and we'll help.` }, { status: 500 });
  }
}
