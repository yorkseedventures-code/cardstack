import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, PASS_DURATION_MS } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";

// Stripe needs the raw body to verify the webhook signature, so this route
// must not run through any body-parsing middleware.
export const runtime = "nodejs";

async function grantEntitlement(opts: {
  userId: string;
  plan: "pass" | "monthly";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSessionId: string | null;
  currentPeriodEnd: Date;
}) {
  const supabase = createAdminClient();
  await supabase.from("entitlements").insert({
    user_id: opts.userId,
    plan: opts.plan,
    status: "active",
    stripe_customer_id: opts.stripeCustomerId,
    stripe_subscription_id: opts.stripeSubscriptionId,
    stripe_session_id: opts.stripeSessionId,
    current_period_end: opts.currentPeriodEnd.toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Fires once a checkout succeeds, for BOTH one-time (pass) and subscription (monthly) purchases.
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const plan = session.metadata?.plan as "pass" | "monthly" | undefined;
        if (!userId || !plan) break;

        if (plan === "pass") {
          await grantEntitlement({
            userId,
            plan: "pass",
            stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId: null,
            stripeSessionId: session.id,
            currentPeriodEnd: new Date(Date.now() + PASS_DURATION_MS),
          });
        } else if (plan === "monthly" && typeof session.subscription === "string") {
          // Pull the real period end from the subscription object rather than assuming 30 days.
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await grantEntitlement({
            userId,
            plan: "monthly",
            stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId: sub.id,
            stripeSessionId: session.id,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          });
        }
        break;
      }

      // Fires on each successful renewal of the monthly subscription — extend the period.
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;
        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = sub.metadata?.user_id;
        if (!userId) break;

        const supabase = createAdminClient();
        await supabase
          .from("entitlements")
          .update({ status: "active", current_period_end: new Date(sub.current_period_end * 1000).toISOString() })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      // Subscription canceled or payment failed permanently — mark it inactive.
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.status === "canceled" || sub.status === "unpaid" || sub.status === "incomplete_expired") {
          const supabase = createAdminClient();
          await supabase
            .from("entitlements")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", sub.id);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handling error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
