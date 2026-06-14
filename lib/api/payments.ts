import { apiRequest } from "@/lib/api/client";
import type { BackendSubscriptionPlan } from "@/lib/auth";

export type PaidSubscriptionPlan = Exclude<
  BackendSubscriptionPlan,
  "Free"
>;

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "Refunded";

export type SubscriptionStatus =
  | "Active"
  | "Canceled"
  | "Expired"
  | "PendingPayment";

export interface VnPayCheckoutResponse {
  paymentId: string;
  merchantTransactionRef: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

export interface VnPayPaymentStatus {
  paymentId: string;
  merchantTransactionRef: string;
  paymentStatus: PaymentStatus;
  subscriptionStatus?: SubscriptionStatus | null;
  subscriptionPlan?: BackendSubscriptionPlan | null;
  amount: number;
  currency: string;
  responseCode?: string | null;
  transactionStatus?: string | null;
  createdAt: string;
  paidAt?: string | null;
  processedAt?: string | null;
}

export function createVnPayCheckout(
  subscriptionPlan: PaidSubscriptionPlan
): Promise<VnPayCheckoutResponse> {
  return apiRequest<VnPayCheckoutResponse>(
    "/api/payments/vnpay/checkout",
    {
      method: "POST",
      body: JSON.stringify({ subscriptionPlan }),
    }
  );
}

export function getVnPayPaymentStatus(
  transactionReference: string
): Promise<VnPayPaymentStatus> {
  return apiRequest<VnPayPaymentStatus>(
    `/api/payments/vnpay/status/${encodeURIComponent(
      transactionReference.trim()
    )}`
  );
}