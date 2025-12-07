-- Migration: Add Payment, Moderation, Admin, Subscription features
-- Run this migration to add support for all new features

-- ============= USER ROLE =============
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'user' CHECK ("role" IN ('user', 'admin', 'moderator'));
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");

-- ============= CAMPAIGN MODERATION =============
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "moderationStatus" TEXT DEFAULT 'pending' CHECK ("moderationStatus" IN ('pending', 'approved', 'rejected'));
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "moderationNote" TEXT;
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP;
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "moderatedBy" TEXT;
CREATE INDEX IF NOT EXISTS "campaigns_moderationStatus_idx" ON "campaigns"("moderationStatus");
CREATE INDEX IF NOT EXISTS "campaigns_moderatedBy_idx" ON "campaigns"("moderatedBy");

-- Update existing campaigns to approved (they were already visible)
UPDATE "campaigns" SET "moderationStatus" = 'approved' WHERE "moderationStatus" IS NULL;

-- ============= PAYMENT TABLE =============
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "donationId" TEXT NOT NULL UNIQUE,
    "provider" TEXT NOT NULL CHECK ("provider" IN ('yookassa', 'cloudpayments')),
    "amount" DECIMAL(15, 2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'succeeded', 'failed', 'cancelled')),
    "providerId" TEXT,
    "paymentUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "payments_donationId_idx" ON "payments"("donationId");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "payments_providerId_idx" ON "payments"("providerId");

-- ============= SUBSCRIPTION RECURRING PAYMENTS =============
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "providerId" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "providerToken" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "lastChargeDate" TIMESTAMP;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "chargeAttempts" INTEGER DEFAULT 0;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "maxChargeAttempts" INTEGER DEFAULT 3;
CREATE INDEX IF NOT EXISTS "subscriptions_providerId_idx" ON "subscriptions"("providerId");
CREATE INDEX IF NOT EXISTS "subscriptions_nextPayment_idx" ON "subscriptions"("nextPayment");

-- ============= REPORTS TABLE (optional, for storing report metadata) =============
CREATE TABLE IF NOT EXISTS "reports" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "fundId" TEXT,
    "periodStart" TIMESTAMP NOT NULL,
    "periodEnd" TIMESTAMP NOT NULL,
    "fileUrl" TEXT,
    "verified" BOOLEAN DEFAULT false,
    "totalCollected" DECIMAL(15, 2) DEFAULT 0,
    "totalDistributed" DECIMAL(15, 2) DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reports_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "partners"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "reports_fundId_idx" ON "reports"("fundId");
CREATE INDEX IF NOT EXISTS "reports_periodStart_idx" ON "reports"("periodStart");

-- ============= ZAKAT CALCULATIONS TABLE =============
CREATE TABLE IF NOT EXISTS "zakat_calculations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "zakatDue" DECIMAL(15, 2) NOT NULL,
    "aboveNisab" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "zakat_calculations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "zakat_calculations_userId_idx" ON "zakat_calculations"("userId");
CREATE INDEX IF NOT EXISTS "zakat_calculations_createdAt_idx" ON "zakat_calculations"("createdAt");

