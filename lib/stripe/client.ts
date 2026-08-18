import "server-only";
import Stripe from "stripe";

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!globalForStripe.stripe) {
    globalForStripe.stripe = new Stripe(key);
  }

  return globalForStripe.stripe;
}