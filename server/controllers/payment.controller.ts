// Payment Controller - Handle payment initiation and webhooks

import { Response } from 'express';
import { PaymentService } from '../services/payment/payment.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/error';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * POST /api/payments/initiate
   * Initiate payment for donation
   */
  initiatePayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { donationId, amount, currency, description, cardNumber, email, returnUrl } = req.body;

    if (!donationId || !amount || !currency || !description) {
      return sendError(res, 'Missing required fields: donationId, amount, currency, description', 400);
    }

    // Get base URL for return URL
    const baseUrl = process.env.SITE_URL || 
                   (req.headers.origin || `http://${req.headers.host}`);

    const paymentData = await this.paymentService.initiatePayment({
      donationId,
      amount: parseFloat(amount),
      currency,
      description,
      returnUrl: returnUrl || `${baseUrl}/payment/success`,
      cardNumber,
      email,
      metadata: {
        userId: req.user?.id,
      },
    });

    sendSuccess(res, paymentData, 'Payment initiated successfully');
  });

  /**
   * GET /api/payments/:id/status
   * Get payment status
   */
  getPaymentStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const payment = await this.paymentService.getPaymentStatus(id);

    if (!payment) {
      return sendError(res, 'Payment not found', 404);
    }

    sendSuccess(res, payment);
  });

  /**
   * POST /api/payments/webhook/yookassa
   * YooKassa webhook handler
   */
  handleYooKassaWebhook = asyncHandler(async (req: any, res: Response) => {
    // Verify webhook signature if needed
    // const signature = req.headers['x-yookassa-signature'];
    // const isValid = paymentService.yookassa.verifyWebhookSignature(JSON.stringify(req.body), signature);
    // if (!isValid) {
    //   return sendError(res, 'Invalid signature', 401);
    // }

    await this.paymentService.handleYooKassaWebhook(req.body);

    // YooKassa expects 200 OK response
    res.status(200).send('OK');
  });

  /**
   * POST /api/payments/webhook/cloudpayments
   * CloudPayments webhook handler
   */
  handleCloudPaymentsWebhook = asyncHandler(async (req: any, res: Response) => {
    // Verify webhook signature if needed
    // const signature = req.headers['content-hmac'];
    // const isValid = paymentService.cloudpayments.verifyWebhookSignature(JSON.stringify(req.body), signature);
    // if (!isValid) {
    //   return sendError(res, 'Invalid signature', 401);
    // }

    await this.paymentService.handleCloudPaymentsWebhook(req.body);

    // CloudPayments expects JSON response
    res.status(200).json({ code: 0 });
  });
}

