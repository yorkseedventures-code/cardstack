// Single source of truth for KoiCard pricing.
// Change a price or limit here and the app, landing page, FAQ and search-engine data all follow.
//
// IMPORTANT: the amounts below are what we DISPLAY. What Stripe actually charges is set by the
// Price objects behind STRIPE_PRICE_PASS and STRIPE_PRICE_MONTHLY. If you change an amount here,
// create a new Price in Stripe, put its id in the env var, and update public/llms.txt by hand.

export const FREE_SCANS_PER_MONTH = 10;

export const PRICING = {
  pass: {
    id: "pass" as const,
    name: "Event Pass",
    amountUsd: 5.99,
    durationDays: 4,
    billing: "one-time",
  },
  monthly: {
    id: "monthly" as const,
    name: "Monthly",
    amountUsd: 7.99,
    billing: "per month",
  },
};

export type PlanId = "pass" | "monthly";

export const usd = (n: number) => `$${n.toFixed(2)}`;

export const PASS_PRICE = usd(PRICING.pass.amountUsd);        // "$5.99"
export const MONTHLY_PRICE = usd(PRICING.monthly.amountUsd);  // "$7.99"
export const PASS_DURATION_MS = PRICING.pass.durationDays * 24 * 60 * 60 * 1000;
