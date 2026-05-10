import { api } from './axios';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'declined'
  | 'insufficient_funds'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface Payment {
  id: number;
  token: string;
  booking: number;
  amount: string;
  currency: string;
  status: PaymentStatus;
  provider: string;
  card_last4: string;
  card_brand: string;
  error_code: string;
  error_message: string;
  created_at: string;
  updated_at: string;
  succeeded_at: string | null;
}

export interface InitiateResponse {
  payment: Payment;
  checkout_url: string;
}

export interface PaymentDetail {
  payment: Payment;
  booking: {
    id: number;
    package_name: string;
    provider_name: string;
    appointment_date: string;
  };
}

export const initiatePayment = async (bookingId: number | string): Promise<InitiateResponse> => {
  const { data } = await api.post<InitiateResponse>('/payments/initiate/', {
    booking_id: Number(bookingId),
  });
  return data;
};

export const getPayment = async (token: string): Promise<PaymentDetail> => {
  const { data } = await api.get<PaymentDetail>(`/payments/${token}/`);
  return data;
};

export interface ProcessPaymentInput {
  card_number: string;
  card_exp_month: string;
  card_exp_year: string;
  card_cvc: string;
  cardholder_name?: string;
}

export interface ProcessResponse {
  payment: Payment;
  succeeded: boolean;
}

export const processPayment = async (
  token: string,
  input: ProcessPaymentInput,
): Promise<ProcessResponse> => {
  const { data } = await api.post<ProcessResponse>(`/payments/${token}/process/`, input);
  return data;
};
