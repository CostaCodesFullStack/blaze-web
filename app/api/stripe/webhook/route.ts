import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { getStripeWebhookSecret } from "@/lib/stripe/config";
import { hasProcessedStripeEvent } from "@/lib/db/repositories/billing";
import {
  createWebhookDeps,
  processWebhookEvent,
} from "@/lib/billing/webhook";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 },
    );
  }

  let body: string;

  try {
    body = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 },
    );
  }

  let stripe;

  try {
    stripe = getStripeClient();
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }

  let webhookSecret: string;

  try {
    webhookSecret = getStripeWebhookSecret();
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 },
    );
  }

  try {
    const alreadyProcessed = await hasProcessedStripeEvent(event.id);

    if (alreadyProcessed) {
      return NextResponse.json({ received: true });
    }

    const deps = createWebhookDeps(stripe);

    await processWebhookEvent(event, deps);

    return NextResponse.json({ received: true });
  } catch {
    console.error("Stripe webhook processing failed", {
      eventId: event.id,
      eventType: event.type,
    });

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}