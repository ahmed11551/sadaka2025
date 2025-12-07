// CloudPayments Payment Service
// Documentation: https://developers.cloudpayments.ru/

const CLOUDPAYMENTS_PUBLIC_ID = process.env.CLOUDPAYMENTS_PUBLIC_ID;
const CLOUDPAYMENTS_SECRET_KEY = process.env.CLOUDPAYMENTS_SECRET_KEY;
const CLOUDPAYMENTS_API_URL = 'https://api.cloudpayments.ru';

export interface CloudPaymentsPaymentRequest {
  Amount: number;
  Currency: string;
  InvoiceId?: string;
  Description?: string;
  AccountId?: string;
  Email?: string;
  RequireConfirmation?: boolean;
  SendEmail?: boolean;
  CultureName?: string;
  Data?: Record<string, any>;
}

export interface CloudPaymentsPaymentResponse {
  Model: {
    TransactionId: number;
    Amount: number;
    Currency: string;
    CurrencyCode: number;
    PaymentAmount: number;
    PaymentCurrency: string;
    PaymentCurrencyCode: number;
    InvoiceId?: string;
    AccountId?: string;
    Email?: string;
    Description?: string;
    JsonData?: Record<string, any>;
    CreatedDate: string;
    PayoutDate?: string;
    PayoutDateIso?: string;
    PayoutAmount?: number;
    CreatedDateIso?: string;
    AuthDate?: string;
    AuthDateIso?: string;
    ConfirmDate?: string;
    ConfirmDateIso?: string;
    AuthCode?: string;
    TestMode: boolean;
    Rrn?: string;
    OriginalTransactionId?: number;
    FallBackScenarioDeclinedTransactionId?: number;
    IpAddress?: string;
    IpCountry?: string;
    IpCity?: string;
    IpRegion?: string;
    IpDistrict?: string;
    IpLatitude?: number;
    IpLongitude?: number;
    CardFirstSix?: string;
    CardLastFour?: string;
    CardExpDate?: string;
    CardType?: string;
    CardProduct?: string;
    CardCategory?: string;
    EscrowAccumulationId?: number;
    IssuerBankCountry?: string;
    Issuer?: string;
    CardTypeCode?: number;
    Status: string;
    StatusCode?: number;
    CultureName?: string;
    Reason?: string;
    ReasonCode?: number;
    CardHolderMessage?: string;
    Type: number;
    Refunded?: boolean;
    Name?: string;
    Token?: string;
    GatewayName?: string;
    ApplePay?: boolean;
    AndroidPay?: boolean;
    WalletType?: string;
    TotalFee?: number;
  };
  Success: boolean;
  Message?: string;
}

export class CloudPaymentsService {
  private publicId: string;
  private secretKey: string;

  constructor() {
    this.publicId = CLOUDPAYMENTS_PUBLIC_ID || '';
    this.secretKey = CLOUDPAYMENTS_SECRET_KEY || '';

    if (!this.publicId || !this.secretKey) {
      console.warn('[CloudPayments] Public ID or Secret Key not configured');
    }
  }

  /**
   * Create payment in CloudPayments
   */
  async createPayment(
    amount: number,
    currency: string,
    description?: string,
    invoiceId?: string,
    accountId?: string,
    email?: string
  ): Promise<CloudPaymentsPaymentResponse> {
    if (!this.publicId || !this.secretKey) {
      throw new Error('CloudPayments credentials not configured');
    }

    const paymentData: CloudPaymentsPaymentRequest = {
      Amount: amount,
      Currency: currency.toUpperCase(),
      Description: description,
      InvoiceId: invoiceId,
      AccountId: accountId,
      Email: email,
      RequireConfirmation: true,
    };

    const auth = Buffer.from(`${this.publicId}:${this.secretKey}`).toString('base64');

    try {
      const response = await fetch(`${CLOUDPAYMENTS_API_URL}/payments/cards/charge`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`CloudPayments API error: ${error.Message || response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[CloudPayments] Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Create subscription (recurring payment token)
   */
  async createSubscription(
    amount: number,
    currency: string,
    accountId: string,
    description?: string
  ): Promise<CloudPaymentsPaymentResponse> {
    if (!this.publicId || !this.secretKey) {
      throw new Error('CloudPayments credentials not configured');
    }

    const paymentData: CloudPaymentsPaymentRequest = {
      Amount: amount,
      Currency: currency.toUpperCase(),
      Description: description,
      AccountId: accountId,
      RequireConfirmation: true,
    };

    const auth = Buffer.from(`${this.publicId}:${this.secretKey}`).toString('base64');

    try {
      const response = await fetch(`${CLOUDPAYMENTS_API_URL}/payments/tokens/charge`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`CloudPayments API error: ${error.Message || response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[CloudPayments] Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature (HMAC)
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.secretKey) return false;

    const crypto = require('crypto') as typeof import('crypto');
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

