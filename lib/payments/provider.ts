// Payment provider abstraction. Only Paystack is implemented; swap by changing PAYMENTS_PROVIDER.

export interface InitiateParams {
  /** Unique reference we generate — carried through the webhook for deterministic matching. */
  reference: string;
  /** Amount in cedis (NUMERIC from DB). Converted to pesewas inside the implementation. */
  amountCedis: number;
  currency: string;
  email: string;
  metadata: Record<string, unknown>;
  /** Paystack redirects here after the buyer completes or closes checkout. Set server-side only. */
  callbackUrl?: string;
}

export interface InitiateResult {
  authorizationUrl: string;
  reference: string;
}

export interface WebhookEvent {
  event: string;
  /** Provider's reference (= our reference, echoed back). */
  reference: string;
  /** Amount in cedis (already converted from provider units). */
  amountCedis: number;
  channel: string;
  metadata: Record<string, unknown>;
  rawPayload: Record<string, unknown>;
}

export interface PaymentProvider {
  initiatePayment(params: InitiateParams): Promise<InitiateResult>;
  /**
   * Verify the webhook signature over the RAW request body string.
   * Must be called BEFORE parsing JSON.
   * Returns true if the signature is valid, false otherwise.
   */
  verifyWebhook(rawBody: string, signatureHeader: string | null): boolean;
  /** Parse the already-verified JSON payload into a normalized WebhookEvent. */
  parseWebhook(payload: Record<string, unknown>): WebhookEvent | null;
  /**
   * Server-side transaction verify — calls the provider's verify API.
   * Returns a WebhookEvent if the charge succeeded, null otherwise.
   * Used by verify-on-return so the portal can reconcile without a webhook tunnel.
   */
  verifyTransaction(reference: string): Promise<WebhookEvent | null>;
}
