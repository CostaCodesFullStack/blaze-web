import { prisma } from "@/lib/db/client";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { SubscriptionStatus } from "@/generated/prisma/enums";

export type Db = PrismaClient | Prisma.TransactionClient;

export type UpsertStripeSubscriptionInput = {
  userId: string;
  applicationId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  status: SubscriptionStatus;
  canceledAt?: Date | null;
};

export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string,
  db: Db = prisma,
) {
  return db.subscription.findUnique({
    where: { stripeSubscriptionId },
  });
}

export async function upsertStripeSubscription(
  data: UpsertStripeSubscriptionInput,
  db: Db = prisma,
) {
  return db.subscription.upsert({
    where: {
      userId_applicationId: {
        userId: data.userId,
        applicationId: data.applicationId,
      },
    },
    update: {
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      status: data.status,
      expiresAt: data.currentPeriodEnd,
      canceledAt: data.canceledAt ?? null,
    },
    create: {
      userId: data.userId,
      applicationId: data.applicationId,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      status: data.status,
      expiresAt: data.currentPeriodEnd,
      canceledAt: data.canceledAt ?? null,
    },
  });
}

export async function updateSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string,
  data: {
    stripePriceId?: string | null;
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
    canceledAt?: Date | null;
    status?: SubscriptionStatus;
    expiresAt?: Date | null;
  },
  db: Db = prisma,
) {
  return db.subscription.update({
    where: { stripeSubscriptionId },
    data,
  });
}

export async function markSubscriptionCanceled(
  stripeSubscriptionId: string,
  canceledAt: Date = new Date(),
  db: Db = prisma,
) {
  return db.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      status: "CANCELED",
      canceledAt,
    },
  });
}

export async function recordStripeEvent(
  stripeEventId: string,
  eventType: string,
  db: Db = prisma,
) {
  return db.stripeEvent.create({
    data: {
      stripeEventId,
      eventType,
      processedAt: new Date(),
    },
  });
}

export async function hasProcessedStripeEvent(
  stripeEventId: string,
  db: Db = prisma,
) {
  const event = await db.stripeEvent.findUnique({
    where: { stripeEventId },
    select: { id: true },
  });

  return event !== null;
}
