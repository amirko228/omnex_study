// ============================================================================
// PAYMENTS API
// ============================================================================

import { apiClient } from '../api-client';
import type {
  Payment,
  PromoCode,
  Transaction,
  PaymentProvider,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const paymentsApi = {
  /**
   * Create payment intent
   */
  async createPayment(params: {
    amount: number;
    currency: string;
    provider: PaymentProvider;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse<{ clientSecret: string; paymentId: string }>> {
    return apiClient.post('/payments/create', params);
  },

  /**
   * Confirm payment
   */
  async confirmPayment(paymentId: string): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(`/payments/${paymentId}/confirm`);
  },

  /**
   * Get payment status
   */
  async getPayment(paymentId: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`/payments/${paymentId}`);
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    return apiClient.get<PaginatedResponse<Payment>>('/payments/history', params);
  },

  /**
   * Request refund
   */
  async requestRefund(
    paymentId: string,
    reason?: string
  ): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(`/payments/${paymentId}/refund`, { reason });
  },

  /**
   * Validate promo code
   */
  async validatePromoCode(code: string): Promise<ApiResponse<PromoCode>> {
    return apiClient.post<PromoCode>('/payments/promo-codes/validate', { code });
  },

  /**
   * Apply promo code
   */
  async applyPromoCode(code: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/promo-codes/apply', { code });
  },

  /**
   * Get transactions history
   */
  async getTransactions(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return apiClient.get<PaginatedResponse<Transaction>>('/transactions', params);
  },

  /**
   * Get invoice
   */
  async getInvoice(transactionId: string): Promise<ApiResponse<Blob>> {
    return apiClient.get(`/transactions/${transactionId}/invoice`);
  },

  /**
   * Update payment method
   */
  async updatePaymentMethod(params: {
    provider: PaymentProvider;
    paymentMethodId: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.post('/payments/methods/update', params);
  },

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<
    ApiResponse<
      Array<{
        id: string;
        provider: PaymentProvider;
        type: string;
        last4?: string;
        expiryMonth?: number;
        expiryYear?: number;
      }>
    >
  > {
    return apiClient.get('/payments/methods');
  },

  /**
   * Remove payment method
   */
  async removePaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/payments/methods/${methodId}`);
  },
};