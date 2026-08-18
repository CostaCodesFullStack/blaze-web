const PLAN_TO_ENV: Record<string, string> = {
  monthly: "STRIPE_PRICE_MONTHLY",
  quarterly: "STRIPE_PRICE_QUARTERLY",
  yearly: "STRIPE_PRICE_YEARLY",
};

export function getStripePriceId(planId: string): string | null {
  const envName = PLAN_TO_ENV[planId];

  if (!envName) {
    return null;
  }

  const value = process.env[envName];

  return value && value.length > 0 ? value : null;
}

export function hasStripeCheckoutConfig(): boolean {
  if (!process.env.STRIPE_SECRET_KEY) {
    return false;
  }

  return Object.keys(PLAN_TO_ENV).every(
    (planId) => getStripePriceId(planId) !== null,
  );
}

export function getStripeWebhookSecret(): string {
  const value = process.env.STRIPE_WEBHOOK_SECRET;

  if (!value || value.length === 0) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  return value;
}