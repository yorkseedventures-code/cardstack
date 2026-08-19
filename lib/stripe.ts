import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  }
  return stripe;
}

export type PlanId = "pass" | "monthly";

export const PLAN_PRICE_ENV: Record<PlanId, string> = {
  pass: "STRIPE_PRICE_PASS",       // one-time $5.99 / Event Pass (4 days)
  monthly: "STRIPE_PRICE_MONTHLY", // recurring $7.99/month
};

export function getPriceId(plan: PlanId): string {
  const envVar = PLAN_PRICE_ENV[plan];
  const priceId = process.env[envVar];
  if (!priceId) throw new Error(`${envVar} is not set`);
  return priceId;
}

export const PASS_DURATION_MS = 4 * 24 * 60 * 60 * 1000; // 4 days
