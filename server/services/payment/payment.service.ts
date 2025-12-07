// Payment Service - Unified payment gateway with BIN detection
// Automatically selects YooKassa (Russia) or CloudPayments (International) based on card BIN

import { YooKassaService } from './yookassa.service';
import { CloudPaymentsService } from './cloudpayments.service';
import prisma from '../../db/client';
import { Prisma } from '@prisma/client';

export type PaymentProvider = 'yookassa' | 'cloudpayments';

export interface PaymentInitRequest {
  donationId: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cardNumber?: string; // First 6 digits (BIN) for provider detection
  email?: string;
  metadata?: Record<string, string>;
}

export interface PaymentInitResponse {
  paymentId: string;
  provider: PaymentProvider;
  paymentUrl: string;
  status: 'pending';
}

/**
 * Detect payment provider based on card BIN (Bank Identification Number)
 * Russian cards: 420000-479999, 520000-559999, 620000-629999 → YooKassa
 * Other cards → CloudPayments
 */
export function detectProviderByBIN(cardNumber: string): PaymentProvider {
  if (!cardNumber || cardNumber.length < 6) {
    // Default to YooKassa for Russia
    return 'yookassa';
  }

  const bin = parseInt(cardNumber.substring(0, 6), 10);

  // Russian card ranges
  if (
    (bin >= 420000 && bin <= 479999) ||
    (bin >= 520000 && bin <= 559999) ||
    (bin >= 620000 && bin <= 629999)
  ) {
    return 'yookassa';
  }

  // International cards
  return 'cloudpayments';
}

export class PaymentService {
  private yookassa: YooKassaService;
  private cloudpayments: CloudPaymentsService;

  constructor() {
    this.yookassa = new YooKassaService();
    this.cloudpayments = new CloudPaymentsService();
  }

  /**
   * Initialize payment - automatically selects provider based on BIN or defaults
   */
  async initiatePayment(data: PaymentInitRequest): Promise<PaymentInitResponse> {
    // Detect provider
    let provider: PaymentProvider = 'yookassa'; // Default
    
    if (data.cardNumber) {
      provider = detectProviderByBIN(data.cardNumber);
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        donationId: data.donationId,
        provider,
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency,
        status: 'pending',
        metadata: data.metadata as any,
      },
    });

    let paymentUrl: string;
    let providerPaymentId: string;

    try {
      if (provider === 'yookassa') {
        const ykPayment = await this.yookassa.createPayment(
          data.amount,
          data.currency,
          data.description,
          data.returnUrl,
          {
            ...data.metadata,
            donationId: data.donationId,
            paymentId: payment.id,
          }
        );

        providerPaymentId = ykPayment.id;
        paymentUrl = ykPayment.confirmation.confirmation_url;
      } else {
        // CloudPayments - for international cards
        const cpPayment = await this.cloudpayments.createPayment(
          data.amount,
          data.currency,
          data.description,
          payment.id,
          data.email
        );

        providerPaymentId = cpPayment.Model.TransactionId.toString();
        paymentUrl = `${data.returnUrl}?transactionId=${providerPaymentId}`;
      }

      // Update payment with provider ID and URL
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerId: providerPaymentId,
          paymentUrl,
        },
      });

      return {
        paymentId: payment.id,
        provider,
        paymentUrl,
        status: 'pending',
      };
    } catch (error) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });

      throw error;
    }
  }

  /**
   * Handle YooKassa webhook
   */
  async handleYooKassaWebhook(event: any): Promise<void> {
    // Find payment by provider ID
    const payment = await prisma.payment.findFirst({
      where: {
        provider: 'yookassa',
        providerId: event.object.id,
      },
      include: { donation: true },
    });

    if (!payment) {
      console.error('[PaymentService] Payment not found for YooKassa webhook:', event.object.id);
      return;
    }

    // Update payment status
    let paymentStatus: 'pending' | 'succeeded' | 'failed' | 'cancelled' = 'pending';
    if (event.event === 'payment.succeeded') {
      paymentStatus = 'succeeded';
    } else if (event.event === 'payment.canceled') {
      paymentStatus = 'cancelled';
    } else if (event.event === 'payment.waiting_for_capture') {
      paymentStatus = 'pending';
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        metadata: event.object as any,
      },
    });

    // Update donation status if payment succeeded
    if (paymentStatus === 'succeeded' && payment.donation) {
      await prisma.donation.update({
        where: { id: payment.donationId },
        data: {
          paymentStatus: 'completed',
          transactionId: event.object.id,
        },
      });
    }
  }

  /**
   * Handle CloudPayments webhook
   */
  async handleCloudPaymentsWebhook(event: any): Promise<void> {
    // Find payment by provider ID
    const payment = await prisma.payment.findFirst({
      where: {
        provider: 'cloudpayments',
        providerId: event.TransactionId?.toString(),
      },
      include: { donation: true },
    });

    if (!payment) {
      console.error('[PaymentService] Payment not found for CloudPayments webhook:', event.TransactionId);
      return;
    }

    // Update payment status
    let paymentStatus: 'pending' | 'succeeded' | 'failed' | 'cancelled' = 'pending';
    if (event.Status === 'Completed') {
      paymentStatus = 'succeeded';
    } else if (event.Status === 'Declined') {
      paymentStatus = 'failed';
    } else if (event.Status === 'Cancelled') {
      paymentStatus = 'cancelled';
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        metadata: event as any,
      },
    });

    // Update donation status if payment succeeded
    if (paymentStatus === 'succeeded' && payment.donation) {
      await prisma.donation.update({
        where: { id: payment.donationId },
        data: {
          paymentStatus: 'completed',
          transactionId: event.TransactionId?.toString(),
        },
      });
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        donation: {
          include: {
            campaign: true,
            partner: true,
          },
        },
      },
    });
  }
}

