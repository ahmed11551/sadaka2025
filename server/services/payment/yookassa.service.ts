// YooKassa Payment Service
// Documentation: https://yookassa.ru/developers/api

import crypto from 'node:crypto';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';

export interface YooKassaPaymentRequest {
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: 'redirect';
    return_url: string;
  };
  capture: boolean;
  description: string;
  metadata?: Record<string, string>;
}

export interface YooKassaPaymentResponse {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  created_at: string;
  description: string;
  metadata?: Record<string, string>;
}

export class YooKassaService {
  private shopId: string;
  private secretKey: string;

  constructor() {
    this.shopId = YOOKASSA_SHOP_ID || '';
    this.secretKey = YOOKASSA_SECRET_KEY || '';

    if (!this.shopId || !this.secretKey) {
      console.warn('[YooKassa] Shop ID or Secret Key not configured');
    }
  }

  /**
   * Create payment in YooKassa
   */
  async createPayment(
    amount: number,
    currency: string,
    description: string,
    returnUrl: string,
    metadata?: Record<string, string>
  ): Promise<YooKassaPaymentResponse> {
    if (!this.shopId || !this.secretKey) {
      throw new Error('YooKassa credentials not configured');
    }

    const paymentData: YooKassaPaymentRequest = {
      amount: {
        value: amount.toFixed(2),
        currency: currency.toUpperCase(),
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      capture: true,
      description,
      ...(metadata && { metadata }),
    };

    const auth = Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64');

    try {
      const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Idempotence-Key': crypto.randomUUID(),
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`YooKassa API error: ${error.description || response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[YooKassa] Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Get payment status from YooKassa
   */
  async getPaymentStatus(paymentId: string): Promise<YooKassaPaymentResponse> {
    if (!this.shopId || !this.secretKey) {
      throw new Error('YooKassa credentials not configured');
    }

    const auth = Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64');

    try {
      const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      if (!response.ok) {
        throw new Error(`YooKassa API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[YooKassa] Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature (HMAC)
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.secretKey) return false;

    const hash = crypto
      .createHmac('sha256', this.secretKey)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(signature)
    );
  }
}

