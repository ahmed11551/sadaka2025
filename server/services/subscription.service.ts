// Subscription Service - Handle recurring payments for subscriptions

import prisma from '../db/client';
import { Prisma } from '@prisma/client';
import { CloudPaymentsService } from './payment/cloudpayments.service';
import { PaymentService } from './payment/payment.service';

export class SubscriptionService {
  private cloudpayments: CloudPaymentsService;
  private paymentService: PaymentService;

  constructor() {
    this.cloudpayments = new CloudPaymentsService();
    this.paymentService = new PaymentService();
  }

  /**
   * Create subscription with recurring payment
   */
  async createSubscription(
    userId: string,
    data: {
      planType: string;
      planName: string;
      billingCycle: string;
      amount: number;
      charityPercent: number;
      paymentToken?: string; // Token from initial payment for recurring charges
    }
  ) {
    const charityAmount = new Prisma.Decimal(data.amount * (data.charityPercent / 100));
    
    // Calculate end date based on billing cycle
    const endDate = this.calculateEndDate(new Date(), data.billingCycle);
    const nextPayment = endDate;

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planType: data.planType,
        planName: data.planName,
        billingCycle: data.billingCycle,
        amount: new Prisma.Decimal(data.amount),
        charityPercent: data.charityPercent,
        charityAmount,
        endDate,
        nextPayment,
        providerToken: data.paymentToken,
        status: 'active',
        autoRenew: true,
      },
    });

    return subscription;
  }

  /**
   * Charge subscription (recurring payment)
   */
  async chargeSubscription(subscriptionId: string): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    if (!subscription.providerToken) {
      console.error(`[SubscriptionService] No provider token for subscription ${subscriptionId}`);
      return false;
    }

    try {
      // Create donation for charity amount if applicable
      if (subscription.charityPercent > 0) {
        await prisma.donation.create({
          data: {
            amount: subscription.charityAmount,
            currency: 'RUB',
            type: 'subscription',
            category: 'mubarakway',
            paymentStatus: 'completed',
            userId: subscription.userId,
            subscriptionId: subscription.id,
            transactionId: `SUB-${subscriptionId}-${Date.now()}`,
          },
        });
      }

      // Update subscription
      const newEndDate = this.calculateEndDate(new Date(), subscription.billingCycle);
      const newNextPayment = newEndDate;

      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          lastPayment: new Date(),
          nextPayment: newNextPayment,
          endDate: newEndDate,
          chargeAttempts: 0, // Reset attempts on success
        },
      });

      return true;
    } catch (error) {
      console.error(`[SubscriptionService] Error charging subscription ${subscriptionId}:`, error);

      // Increment charge attempts
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          chargeAttempts: {
            increment: 1,
          },
        },
      });

      // Cancel subscription if max attempts reached
      const updated = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (updated && updated.chargeAttempts >= (updated.maxChargeAttempts || 3)) {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'cancelled',
            autoRenew: false,
          },
        });
      }

      return false;
    }
  }

  /**
   * Process all due subscriptions (to be called by cron job)
   */
  async processDueSubscriptions() {
    const now = new Date();
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        nextPayment: {
          lte: now,
        },
        autoRenew: true,
      },
      include: { user: true },
    });

    const results = await Promise.allSettled(
      dueSubscriptions.map((sub) => this.chargeSubscription(sub.id))
    );

    return {
      total: dueSubscriptions.length,
      succeeded: results.filter((r) => r.status === 'fulfilled' && r.value).length,
      failed: results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value)).length,
    };
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(subscriptionId: string, userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== userId) {
      throw new Error('Subscription not found or access denied');
    }

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        autoRenew: false,
      },
    });
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string, userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== userId) {
      throw new Error('Subscription not found or access denied');
    }

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        autoRenew: true,
        status: 'active',
      },
    });
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== userId) {
      throw new Error('Subscription not found or access denied');
    }

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'cancelled',
        autoRenew: false,
      },
    });
  }

  /**
   * Calculate end date based on billing cycle
   */
  private calculateEndDate(startDate: Date, billingCycle: string): Date {
    const endDate = new Date(startDate);

    switch (billingCycle) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case '6months':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case '12months':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case '3years':
        endDate.setFullYear(endDate.getFullYear() + 3);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    return endDate;
  }
}

