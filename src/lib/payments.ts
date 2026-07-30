/**
 * PAY-1 — the payment-orchestration interface. Booking logic talks to this
 * interface only; Stripe (Connect + Tax + Radar) is the v1 implementation,
 * a mock is the dev/CI implementation, and a second rail can be added
 * without touching booking code (the Decision #17 memo relies on this).
 *
 * PAY-15 (SAQ-A): card data never touches this server. The Stripe rail
 * creates a PaymentIntent and hands the client secret to Stripe-hosted
 * fields (Payment Element) in the browser; 3DS2 (PAY-16) runs there too.
 */

import { buyerRegionOf, PAYMENT_METHODS_BY_REGION } from "./config/markets";
import type { Money } from "./money";

export interface PaymentRequest {
  /** Idempotency key from the booking (NFR-11). */
  idempotencyKey: string;
  amount: Money;
  /** Commission the platform retains (PAY-5), taken as application fee. */
  applicationFee: Money;
  /** Destination Connect account of the provider's Organisation (PAY-2). */
  connectAccountId: string;
  /** PAY-8: when set, funds are captured now but released to the provider at this time. */
  holdUntil: Date | null;
  buyerEmail: string;
  /** Buyer country evidence, used for PAY-19 payment-method resolution. */
  buyerCountry: string | null;
  /** Carried in provider metadata so webhooks can map events back to the booking. */
  bookingReference: string;
  description: string;
}

export interface IntentResult {
  ok: boolean;
  intentRef: string;
  /**
   * Secret the browser uses to confirm payment in Stripe-hosted fields.
   * `null` means the rail settled server-side (mock) and no client
   * confirmation step exists.
   */
  clientSecret: string | null;
  declineReason?: string;
}

export type IntentStatus = "succeeded" | "processing" | "requires_payment" | "failed";

export interface PaymentProvider {
  name: string;
  createIntent(request: PaymentRequest): Promise<IntentResult>;
  intentStatus(intentRef: string): Promise<IntentStatus>;
  refund(intentRef: string, amount: Money): Promise<{ ok: boolean }>;
}

/**
 * PAY-19 — buyer payment methods resolved server-side from region config.
 * Wallets (Apple Pay / Google Pay) ride on the `card` payment method in
 * Stripe's model, so they map to no extra type here; the Payment Element
 * surfaces them automatically on capable devices.
 */
const STRIPE_TYPE_BY_CONFIG_METHOD: Record<string, string | null> = {
  card: "card",
  link: "link",
  ach_debit: "us_bank_account",
  klarna: "klarna",
  apple_pay: null,
  google_pay: null,
};

export function stripePaymentMethodTypes(buyerCountry: string | null): string[] {
  const region = buyerCountry ? buyerRegionOf(buyerCountry) : "DEFAULT";
  const methods = PAYMENT_METHODS_BY_REGION[region] ?? PAYMENT_METHODS_BY_REGION.DEFAULT;
  const types: string[] = [];
  for (const method of methods) {
    const type = STRIPE_TYPE_BY_CONFIG_METHOD[method] ?? null;
    if (type && !types.includes(type)) types.push(type);
  }
  return types.length > 0 ? types : ["card"];
}

/** Deterministic mock: succeeds unless the email localpart is "decline". */
class MockPaymentProvider implements PaymentProvider {
  name = "mock";

  async createIntent(request: PaymentRequest): Promise<IntentResult> {
    if (request.buyerEmail.startsWith("decline@") || request.buyerEmail.startsWith("decline+")) {
      return { ok: false, intentRef: "", clientSecret: null, declineReason: "card_declined" };
    }
    return { ok: true, intentRef: `mock_pi_${request.idempotencyKey}`, clientSecret: null };
  }

  async intentStatus(): Promise<IntentStatus> {
    return "succeeded";
  }

  async refund(): Promise<{ ok: boolean }> {
    return { ok: true };
  }
}

class StripePaymentProvider implements PaymentProvider {
  name = "stripe";

  private async client() {
    const { default: Stripe } = await import("stripe");
    return new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createIntent(request: PaymentRequest): Promise<IntentResult> {
    const stripe = await this.client();
    try {
      // Destination charge with application fee — platform as limited
      // payment agent (PAY-13); Radar runs on the platform account (PAY-1).
      // PAY-8 escrow uses standard capture + delayed transfer; the transfer
      // is created by the release job at holdUntil.
      const intent = await stripe.paymentIntents.create(
        {
          amount: request.amount.amount,
          currency: request.amount.currency.toLowerCase(),
          receipt_email: request.buyerEmail,
          description: request.description,
          payment_method_types: stripePaymentMethodTypes(request.buyerCountry),
          application_fee_amount: request.applicationFee.amount,
          transfer_data: { destination: request.connectAccountId },
          metadata: { booking_reference: request.bookingReference },
        },
        { idempotencyKey: request.idempotencyKey },
      );
      return { ok: true, intentRef: intent.id, clientSecret: intent.client_secret };
    } catch (error) {
      return {
        ok: false,
        intentRef: "",
        clientSecret: null,
        declineReason: error instanceof Error ? error.message : "payment_failed",
      };
    }
  }

  async intentStatus(intentRef: string): Promise<IntentStatus> {
    const stripe = await this.client();
    try {
      const intent = await stripe.paymentIntents.retrieve(intentRef);
      if (intent.status === "succeeded") return "succeeded";
      if (intent.status === "processing") return "processing";
      if (intent.status === "canceled") return "failed";
      return "requires_payment";
    } catch {
      return "failed";
    }
  }

  async refund(intentRef: string, amount: Money): Promise<{ ok: boolean }> {
    const stripe = await this.client();
    try {
      await stripe.refunds.create({ payment_intent: intentRef, amount: amount.amount });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }
}

/**
 * The Stripe rail needs both halves of the key pair: the secret key for
 * intents server-side and the publishable key for hosted fields client-side.
 * With either missing the app stays on the mock rail (dev/CI).
 */
export function stripeRailActive(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function paymentProvider(): PaymentProvider {
  if (stripeRailActive()) return new StripePaymentProvider();
  return new MockPaymentProvider();
}
