-- Migration: Add Payment model, Campaign moderation, User role, Subscription tokens
-- Run this migration to add support for payments, moderation, and admin features

-- Add role to User table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'user' CHECK ("role" IN ('user', 'admin', 'moderator'));

-- Add moderation fields to Campaign table
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "moderationStatus" TEXT DEFAULT 'pending' CHECK ("moderationStatus" IN ('pending', 'approved', 'rejected'));
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "moderationNote" TEXT;
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP;
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "moderatedBy" TEXT;

-- Add provider token fields to Subscription table
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "providerId" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "providerToken" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "lastChargeDate" TIMESTAMP;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "chargeAttempts" INTEGER DEFAULT 0;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "maxChargeAttempts" INTEGER DEFAULT 3;

-- Create Payment table
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
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

-- Create indexes for moderation
CREATE INDEX IF NOT EXISTS "campaigns_moderationStatus_idx" ON "campaigns"("moderationStatus");
CREATE INDEX IF NOT EXISTS "campaigns_moderatedBy_idx" ON "campaigns"("moderatedBy");

-- Create indexes for user role
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");

-- Create indexes for subscription provider
CREATE INDEX IF NOT EXISTS "subscriptions_providerId_idx" ON "subscriptions"("providerId");
CREATE INDEX IF NOT EXISTS "subscriptions_nextPayment_idx" ON "subscriptions"("nextPayment");

-- Update existing campaigns to approved (if needed)
UPDATE "campaigns" SET "moderationStatus" = 'approved' WHERE "moderationStatus" IS NULL;

