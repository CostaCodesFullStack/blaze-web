import type Stripe from "stripe";
import { prisma } from "@/lib/db/client";
import type { Db } from "@/lib/db/repositories/billing";
import {
  getSubscriptionByStripeSubscriptionId,
  markSubscriptionCanceled,
  recordStripeEvent,
  updateSubscriptionByStripeSubscriptionId,
  upsertStripeSubscription,
  type UpsertStripeSubscriptionInput,
} from "@/lib/db/repositories/billing";
import { getApplicationById } from "@/lib/db/repositories/applications";
import { getGuildById, getUserGuild } from "@/lib/db/repositories/guilds";
import { getGuildApplication } from "@/lib/db/repositories/guild-applications";
import { getSubscriptionByUserAndApplication } from "@/lib/db/repositories/subscriptions";
import { getUserById } from "@/lib/db/repositories/users";
import { getStripePriceId } from "@/lib/stripe/config";
import { getSubscriptionPlanById } from "@/lib/subscribe/plans";
import type { SubscriptionStatus } from "@/generated/prisma/enums";

type StrictStripeSubscription = Stripe.Subscription & {
  current_period_start?: number | null;
  current_period_end?: number | null;
};

export type StripeSubscriptionLike = {
  id: string;
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null;
  canceled_at?: number | null;
  items: {
    data: Array<{
      price: { id: string };
      current_period_start?: number;
      current_period_end?: number;
    }>;
  };
};

type ParsedSubscription = {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
};

export type WebhookDeps = {
  stripe: Pick<Stripe, "subscriptions"> & {
    webhooks: Pick<Stripe["webhooks"], "constructEvent">;
  };
  getUserById: typeof getUserById;
  getApplicationById: typeof getApplicationById;
  getGuildById: typeof getGuildById;
  getUserGuild: typeof getUserGuild;
  getGuildApplication: typeof getGuildApplication;
  getSubscriptionByStripeSubscriptionId: typeof getSubscriptionByStripeSubscriptionId;
  getSubscriptionByUserAndApplication: typeof getSubscriptionByUserAndApplication;
  upsertStripeSubscription: typeof upsertStripeSubscription;
  updateSubscriptionByStripeSubscriptionId: typeof updateSubscriptionByStripeSubscriptionId;
  markSubscriptionCanceled: typeof markSubscriptionCanceled;
  recordStripeEvent: typeof recordStripeEvent;
  getStripePriceId: typeof getStripePriceId;
  getSubscriptionPlanById: typeof getSubscriptionPlanById;
  runInTransaction: (fn: (tx: Db) => Promise<void>) => Promise<void>;
};

export function createWebhookDeps(stripe: Stripe): WebhookDeps {
  return {
    stripe,
    getUserById,
    getApplicationById,
    getGuildById,
    getUserGuild,
    getGuildApplication,
    getSubscriptionByStripeSubscriptionId,
    getSubscriptionByUserAndApplication,
    upsertStripeSubscription,
    updateSubscriptionByStripeSubscriptionId,
    markSubscriptionCanceled,
    recordStripeEvent,
    getStripePriceId,
    getSubscriptionPlanById,
    runInTransaction: (fn) => prisma.$transaction(fn),
  };
}

export function mapStripeSubscriptionStatus(
  status: string | undefined,
): SubscriptionStatus | null {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "canceled":
      return "CANCELED";
    case "incomplete":
    case "past_due":
    case "unpaid":
    case "paused":
      return "INACTIVE";
    case "incomplete_expired":
      return "EXPIRED";
    default:
      return null;
  }
}

export function parseStripeSubscription(
  subscription: StripeSubscriptionLike,
): ParsedSubscription {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : null;
  const priceId = subscription.items.data[0]?.price?.id ?? null;

  const periodStart =
    (subscription as StrictStripeSubscription).current_period_start ??
    subscription.items.data[0]?.current_period_start ??
    null;
  const periodEnd =
    (subscription as StrictStripeSubscription).current_period_end ??
    subscription.items.data[0]?.current_period_end ??
    null;

  if (!customerId || !priceId || !periodStart || !periodEnd) {
    throw new Error("Subscrição Stripe com dados insuficientes.");
  }

  return {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    currentPeriodStart: new Date(periodStart * 1000),
    currentPeriodEnd: new Date(periodEnd * 1000),
  };
}

export async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  deps: WebhookDeps,
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;

  if (!session.id || session.mode !== "subscription") {
    throw new Error("Checkout session inválida.");
  }

  if (session.payment_status !== "paid") {
    throw new Error("Checkout session não paga.");
  }

  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : null;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null;

  if (!stripeSubscriptionId || !stripeCustomerId) {
    throw new Error("Checkout session sem assinatura ou cliente.");
  }

  const metadata = session.metadata;
  const userId = metadata?.userId ?? null;
  const applicationId = metadata?.applicationId ?? null;
  const guildId = metadata?.guildId ?? null;
  const planId = metadata?.planId ?? null;
  const discordId = metadata?.discordId ?? null;

  if (!userId || !applicationId || !guildId || !planId || !discordId) {
    console.error("Stripe webhook: metadata incompleta", {
      eventId: event.id,
      userId: userId ?? undefined,
      applicationId: applicationId ?? undefined,
      guildId: guildId ?? undefined,
      planId: planId ?? undefined,
    });
    throw new Error("Metadata incompleta.");
  }

  let subscription: StripeSubscriptionLike;
  try {
    subscription = (await deps.stripe.subscriptions.retrieve(
      stripeSubscriptionId,
    )) as StripeSubscriptionLike;
  } catch {
    console.error("Stripe webhook: falha ao buscar assinatura", {
      eventId: event.id,
      stripeSubscriptionId,
    });
    throw new Error("Falha ao buscar assinatura no Stripe.");
  }

  const parsed = parseStripeSubscription(subscription);

  const plan = deps.getSubscriptionPlanById(planId);
  const expectedPriceId = deps.getStripePriceId(planId);

  if (!plan || !expectedPriceId || expectedPriceId !== parsed.stripePriceId) {
    console.error("Stripe webhook: plano ou preço inválido", {
      eventId: event.id,
      userId,
      applicationId,
      guildId,
      planId,
    });
    throw new Error("Plano ou preço não correspondem.");
  }

  const user = await deps.getUserById(userId);
  if (!user) {
    console.error("Stripe webhook: usuário inexistente", {
      eventId: event.id,
      userId,
    });
    throw new Error("Usuário não encontrado.");
  }

  if (user.discordId !== discordId) {
    console.error("Stripe webhook: discordId divergente", {
      eventId: event.id,
      userId,
    });
    throw new Error("Discord ID não corresponde.");
  }

  const application = await deps.getApplicationById(applicationId);
  if (!application) {
    console.error("Stripe webhook: aplicação inexistente", {
      eventId: event.id,
      applicationId,
    });
    throw new Error("Aplicação não encontrada.");
  }

  if (!application.active) {
    console.error("Stripe webhook: aplicação inativa", {
      eventId: event.id,
      applicationId,
    });
    throw new Error("Aplicação inativa.");
  }

  const guild = await deps.getGuildById(guildId);
  if (!guild) {
    console.error("Stripe webhook: guild inexistente", {
      eventId: event.id,
      guildId,
    });
    throw new Error("Guild não encontrada.");
  }

  const userGuild = await deps.getUserGuild(userId, guildId);
  if (!userGuild) {
    console.error("Stripe webhook: vínculo UserGuild ausente", {
      eventId: event.id,
      userId,
      guildId,
    });
    throw new Error("Usuário não vinculado à guild.");
  }

  const guildApplication = await deps.getGuildApplication(guildId, applicationId);
  if (!guildApplication) {
    console.error("Stripe webhook: vínculo GuildApplication ausente", {
      eventId: event.id,
      guildId,
      applicationId,
    });
    throw new Error("Aplicação não vinculada à guild.");
  }

  const data: UpsertStripeSubscriptionInput = {
    userId,
    applicationId,
    stripeCustomerId: parsed.stripeCustomerId,
    stripeSubscriptionId: parsed.stripeSubscriptionId,
    stripePriceId: parsed.stripePriceId,
    currentPeriodStart: parsed.currentPeriodStart,
    currentPeriodEnd: parsed.currentPeriodEnd,
    status: "ACTIVE",
    canceledAt: null,
  };

  await deps.runInTransaction(async (tx) => {
    const existing = await deps.getSubscriptionByUserAndApplication(
      userId,
      applicationId,
      tx,
    );

    const staleCheckout =
      existing?.stripeSubscriptionId &&
      existing.stripeSubscriptionId !== parsed.stripeSubscriptionId &&
      existing.currentPeriodStart &&
      existing.currentPeriodStart.getTime() > parsed.currentPeriodStart.getTime();

    if (staleCheckout) {
      console.warn(
        "Stripe webhook: checkout.session.completed obsoleto ignorado",
        {
          eventId: event.id,
          userId,
          applicationId,
          existingStripeSubscriptionId: existing.stripeSubscriptionId,
          incomingStripeSubscriptionId: parsed.stripeSubscriptionId,
        },
      );
    } else {
      await deps.upsertStripeSubscription(data, tx);
    }

    await deps.recordStripeEvent(event.id, event.type, tx);
  });
}

export async function handleSubscriptionUpdated(
  event: Stripe.Event,
  deps: WebhookDeps,
): Promise<void> {
  const subscription =
    event.data.object as StrictStripeSubscription & StripeSubscriptionLike;

  const existing = await deps.getSubscriptionByStripeSubscriptionId(
    subscription.id,
  );

  if (!existing) {
    console.warn(
      "Stripe webhook: assinatura não localizada no update (provavelmente substituída por um checkout mais recente), evento ignorado",
      {
        eventId: event.id,
        stripeSubscriptionId: subscription.id,
      },
    );
    await deps.runInTransaction(async (tx) => {
      await deps.recordStripeEvent(event.id, event.type, tx);
    });
    return;
  }

  const parsed = parseStripeSubscription(subscription);
  const status =
    mapStripeSubscriptionStatus(subscription.status) ?? existing.status;
  const canceledAt = subscription.canceled_at
    ? new Date(subscription.canceled_at * 1000)
    : null;

  await deps.runInTransaction(async (tx) => {
    await deps.updateSubscriptionByStripeSubscriptionId(
      subscription.id,
      {
        stripePriceId: parsed.stripePriceId,
        currentPeriodStart: parsed.currentPeriodStart,
        currentPeriodEnd: parsed.currentPeriodEnd,
        canceledAt,
        status,
        expiresAt: parsed.currentPeriodEnd,
      },
      tx,
    );
    await deps.recordStripeEvent(event.id, event.type, tx);
  });
}

export async function handleSubscriptionDeleted(
  event: Stripe.Event,
  deps: WebhookDeps,
): Promise<void> {
  const subscription =
    event.data.object as StrictStripeSubscription & StripeSubscriptionLike;

  const existing = await deps.getSubscriptionByStripeSubscriptionId(
    subscription.id,
  );

  if (!existing) {
    console.warn(
      "Stripe webhook: assinatura não localizada no delete (provavelmente substituída por um checkout mais recente), evento ignorado",
      {
        eventId: event.id,
        stripeSubscriptionId: subscription.id,
      },
    );
    await deps.runInTransaction(async (tx) => {
      await deps.recordStripeEvent(event.id, event.type, tx);
    });
    return;
  }

  const canceledAt = subscription.canceled_at
    ? new Date(subscription.canceled_at * 1000)
    : new Date();

  await deps.runInTransaction(async (tx) => {
    await deps.markSubscriptionCanceled(subscription.id, canceledAt, tx);
    await deps.recordStripeEvent(event.id, event.type, tx);
  });
}

export async function processWebhookEvent(
  event: Stripe.Event,
  deps: WebhookDeps,
): Promise<boolean> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event, deps);
      return true;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event, deps);
      return true;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event, deps);
      return true;
    default:
      return false;
  }
}