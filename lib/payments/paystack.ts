import { createHmac, timingSafeEqual } from "crypto";
import type { InitiateParams, InitiateResult, PaymentProvider, WebhookEvent } from "./provider";

const BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  if (process.env.NODE_ENV === "production" && key.startsWith("sk_test_")) {
    console.warn("[paystack] WARNING: using a test key (sk_test_…) in production — payments will not settle");
  }
  return key;
}

function getWebhookSecret(): string {
  const key = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!key) throw new Error("PAYSTACK_WEBHOOK_SECRET is not set");
  return key;
}

export const paystackProvider: PaymentProvider = {
  async initiatePayment(params: InitiateParams): Promise<InitiateResult> {
    const secretKey = getSecretKey();

    // Amount in pesewas: multiply cedis by 100, round to nearest integer.
    // Never pass a float to Paystack.
    const amountPesewas = Math.round(params.amountCedis * 100);

    const res = await fetch(`${BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference: params.reference,
        amount: amountPesewas,
        currency: params.currency,
        email: params.email,
        metadata: params.metadata,
        ...(params.callbackUrl ? { callback_url: params.callbackUrl } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(`Paystack initialize failed: ${res.status} — ${JSON.stringify(body)}`);
    }

    const data = await res.json() as {
      status: boolean;
      data: { authorization_url: string; reference: string };
    };

    if (!data.status || !data.data?.authorization_url) {
      throw new Error("Paystack initialize: unexpected response shape");
    }

    return {
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  },

  verifyWebhook(rawBody: string, signatureHeader: string | null): boolean {
    if (!signatureHeader) return false;
    const secret = getWebhookSecret();
    const computed = createHmac("sha512", secret).update(rawBody).digest("hex");
    // Constant-time compare to prevent timing attacks.
    try {
      return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(signatureHeader, "hex"));
    } catch {
      // Buffers of different lengths: invalid signature
      return false;
    }
  },

  async verifyTransaction(reference: string): Promise<WebhookEvent | null> {
    let secretKey: string
    try {
      secretKey = getSecretKey()
    } catch {
      return null
    }

    let res: Response
    try {
      res = await fetch(
        `${BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${secretKey}` } },
      )
    } catch {
      return null
    }

    if (!res.ok) return null

    const json = await res.json().catch(() => null) as {
      status: boolean
      data?: Record<string, unknown>
    } | null
    if (!json?.status || !json.data) return null

    const data = json.data
    if (data.status !== "success") return null

    const amountPesewas = data.amount
    if (typeof amountPesewas !== "number") return null

    return {
      event: "charge.success",
      reference: data.reference as string,
      amountCedis: amountPesewas / 100,
      channel: (data.channel as string | undefined) ?? "unknown",
      metadata: (data.metadata as Record<string, unknown> | undefined) ?? {},
      rawPayload: data,
    }
  },

  parseWebhook(payload: Record<string, unknown>): WebhookEvent | null {
    const event = payload.event as string | undefined;
    if (event !== "charge.success") return null;

    const data = payload.data as Record<string, unknown> | undefined;
    if (!data) return null;

    const reference = data.reference as string | undefined;
    if (!reference) return null;

    // Amount from Paystack is in pesewas — convert back to cedis.
    const amountPesewas = data.amount as number | undefined;
    if (typeof amountPesewas !== "number") return null;
    const amountCedis = amountPesewas / 100;

    const channel = (data.channel as string | undefined) ?? "unknown";
    const metadata = (data.metadata as Record<string, unknown> | undefined) ?? {};

    return {
      event,
      reference,
      amountCedis,
      channel,
      metadata,
      rawPayload: payload,
    };
  },
};
