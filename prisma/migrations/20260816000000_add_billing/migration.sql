-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "canceledAt" DATETIME;
ALTER TABLE "Subscription" ADD COLUMN "currentPeriodEnd" DATETIME;
ALTER TABLE "Subscription" ADD COLUMN "currentPeriodStart" DATETIME;
ALTER TABLE "Subscription" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "stripePriceId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "stripeSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeEvent_stripeEventId_key" ON "StripeEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "StripeEvent_eventType_idx" ON "StripeEvent"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");