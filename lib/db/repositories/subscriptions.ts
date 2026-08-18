import { prisma } from "@/lib/db/client";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";

export type Db = PrismaClient | Prisma.TransactionClient;

export async function getUserSubscriptions(userId: string) {
  return prisma.subscription.findMany({
    where: { userId },
    include: {
      application: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSubscriptionByUserAndApplication(
  userId: string,
  applicationId: string,
  db: Db = prisma,
) {
  return db.subscription.findUnique({
    where: {
      userId_applicationId: {
        userId,
        applicationId,
      },
    },
  });
}