// Payment API - Handle payment initialization and status

import { fetchApi } from './api';

export interface PaymentInitRequest {
  donationId: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl?: string;
  cardNumber?: string;
  email?: string;
}

export interface PaymentInitResponse {
  paymentId: string;
  provider: 'yookassa' | 'cloudpayments';
  paymentUrl: string;
  status: 'pending';
}

export const paymentApi = {
  /**
   * Initialize payment for donation
   */
  initiatePayment: async (data: PaymentInitRequest): Promise<PaymentInitResponse> => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://sadaka2025.vercel.app';

    return fetchApi('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        returnUrl: data.returnUrl || `${baseUrl}/payment/success`,
      }),
    });
  },

  /**
   * Get payment status
   */
  getPaymentStatus: async (paymentId: string) => {
    return fetchApi(`/payments/${paymentId}/status`);
  },
};

