import { getApplicationById } from "@/lib/db/repositories/applications";
import { getSubscriptionByUserAndApplication } from "@/lib/db/repositories/subscriptions";
import type { Application, Subscription } from "@/generated/prisma/client";

export type SubscriptionAccessStatus =
  | "NONE"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELED"
  | "INACTIVE";

export type ApplicationAccessResult = {
  allowed: boolean;
  status: SubscriptionAccessStatus;
};

export function resolveApplicationAccess(
  application: Pick<Application, "active">,
  subscription: Pick<Subscription, "status" | "currentPeriodEnd"> | null,
  now: Date = new Date(),
): ApplicationAccessResult {
  if (!subscription) {
    return { allowed: false, status: "NONE" };
  }

  const expired =
    subscription.currentPeriodEnd !== null &&
    subscription.currentPeriodEnd.getTime() <= now.getTime();

  const status: SubscriptionAccessStatus =
    subscription.status === "ACTIVE" && expired ? "EXPIRED" : subscription.status;

  return {
    allowed: application.active && status === "ACTIVE",
    status,
  };
}

export async function canAccessApplication(
  userId: string,
  applicationId: string,
): Promise<ApplicationAccessResult> {
  const application = await getApplicationById(applicationId);

  if (!application) {
    return { allowed: false, status: "NONE" };
  }

  const subscription = await getSubscriptionByUserAndApplication(
    userId,
    applicationId,
  );

  return resolveApplicationAccess(application, subscription);
}