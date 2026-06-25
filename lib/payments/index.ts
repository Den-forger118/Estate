import type { PaymentProvider } from "./provider";
import { paystackProvider } from "./paystack";

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENTS_PROVIDER ?? "paystack";
  if (provider === "paystack") return paystackProvider;
  throw new Error(`Unknown PAYMENTS_PROVIDER: "${provider}"`);
}

export type { PaymentProvider, InitiateParams, InitiateResult, WebhookEvent } from "./provider";
