# Local Webhook Testing with ngrok

Paystack webhooks are delivered from Paystack's servers (cloud) to your webhook URL.
In local development the dev server runs on `localhost:3000`, which Paystack cannot reach.
Use ngrok to expose the local port to a public HTTPS URL.

---

## Prerequisites

- Dev server running: `npm run dev`
- ngrok installed:

```bash
# macOS / Homebrew
brew install ngrok/ngrok/ngrok

# npm global (cross-platform, requires Node 16+)
npm install -g ngrok

# Or download the binary from https://ngrok.com/download and add to PATH
```

---

## Step 1 — Start the tunnel

In a **second terminal** (keep `npm run dev` running in the first):

```bash
npm run dev:tunnel
# or: npx ngrok http 3000
```

ngrok prints a Forwarding line like:

```
Forwarding  https://a1b2-c3d4-e5f6.ngrok-free.app -> http://localhost:3000
```

Copy the `https://...ngrok-free.app` URL — that is your public base URL.

> **Note:** The ngrok subdomain changes every restart on the free tier.
> Re-do Step 2 each time you restart ngrok, or sign up for a free account
> and use a reserved domain (`ngrok config add-authtoken <token>`).

---

## Step 2 — Set the webhook URL in Paystack Dashboard

1. Go to [dashboard.paystack.com](https://dashboard.paystack.com) → **Settings → API Keys & Webhooks**.
2. Set **Webhook URL** to:

   ```
   https://<your-ngrok-subdomain>.ngrok-free.app/api/v1/payments/webhook
   ```

3. Click **Save**.

---

## Step 3 — Verify your `.env` is consistent

Paystack signs webhooks with HMAC-SHA512 using your **Secret Key** as the HMAC key.
There is no separate webhook signing secret — `PAYSTACK_WEBHOOK_SECRET` must equal
`PAYSTACK_SECRET_KEY`:

```env
PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxx"
PAYSTACK_WEBHOOK_SECRET="sk_test_xxxxxxxxxxxxxxxx"   # same value
```

If these differ, every webhook returns 401 and no installment is ever reconciled.

---

## Step 4 — Test a payment

1. Log in as `buyer@specialgardens.example / Buyer1234!`.
2. Click **Pay now** on installment #3 (DUE, GH₵ 84,500).
3. Complete the Paystack sandbox checkout (use test card `4084084084084081`, any future
   expiry, any CVV/OTP).
4. Paystack delivers a `charge.success` webhook to your ngrok URL.
5. Check server logs for `[webhook] Payment <id> created — reconStatus: MATCHED`.
6. Return to `/portal` — installment #3 is now **PAID** and "Paid to Date" shows
   GH₵ 422,500 (40% → 50%).

---

## Step 5 — Verify idempotency

Send the same webhook twice (Paystack retries, or replay via the ngrok Inspector at
`http://localhost:4040`):

```bash
# ngrok web inspector
open http://localhost:4040
# Click "Replay" on the charge.success event
```

The second delivery hits the idempotency guard and returns `{ received: true }` without
creating a duplicate Payment row or flipping the installment status again.

---

## Callback URL note

The `callbackUrl` (where Paystack redirects the buyer's browser after payment) is set
server-side to `${NEXTAUTH_URL}/portal?payment=done`. If the buyer is on the **same
machine** as the dev server, keeping `NEXTAUTH_URL=http://localhost:3000` is fine.

If testing from a different device (phone, remote browser), set:

```env
NEXTAUTH_URL="https://<your-ngrok-subdomain>.ngrok-free.app"
```

so the browser redirect points to the publicly accessible URL.

---

## Fallback: verify-on-return (no tunnel required)

Even without a tunnel, payments reconcile automatically when the buyer returns to the
portal. The portal server calls Paystack's Transaction Verify API server-side,
confirms the charge succeeded, and runs the same reconciliation path. See
`app/portal/page.tsx` — `runVerifyOnReturn()`.

Webhook and verify-on-return are both safe to fire for the same reference:
idempotency on `provider_ref` ensures only one Payment row is created.
