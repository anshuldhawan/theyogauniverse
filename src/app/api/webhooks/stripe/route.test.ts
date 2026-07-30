import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkout } from "@/lib/booking";
import { bookingByReference, updateBooking } from "@/lib/repo";
import { POST } from "./route";

const WEBHOOK_SECRET = "whsec_test_secret_for_unit_tests";

/** Reset the in-memory store between tests. */
beforeEach(() => {
  (globalThis as Record<string, unknown>).__theYogaUniverseStore = undefined;
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

afterEach(() => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
});

async function confirmedBooking() {
  const result = await checkout({
    providerSlug: "koji",
    slotId: "koji-0",
    guestName: "Test Guest",
    guestEmail: "guest@example.com",
    waiverAccepted: true,
    idempotencyKey: `key-${Math.random()}`,
    evidence: { geoIpCountry: "US", billingCountry: "US", cardIssuerCountry: "US" },
  });
  if (!result.ok) throw new Error("test checkout failed");
  return result.booking;
}

function signedRequest(event: Record<string, unknown>, secret = WEBHOOK_SECRET): Request {
  const payload = JSON.stringify(event);
  const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": signature, "content-type": "application/json" },
    body: payload,
  });
}

describe("Stripe webhook receiver", () => {
  it("rejects payloads with an invalid signature", async () => {
    const booking = await confirmedBooking();
    const response = await POST(
      signedRequest(
        {
          id: "evt_1",
          type: "charge.dispute.created",
          data: { object: { payment_intent: booking.paymentIntentRef } },
        },
        "whsec_wrong_secret",
      ),
    );
    expect(response.status).toBe(400);
    expect(bookingByReference(booking.reference)?.state).toBe("confirmed");
  });

  it("moves the booking to disputed on charge.dispute.created (PAY-20)", async () => {
    const booking = await confirmedBooking();
    const response = await POST(
      signedRequest({
        id: "evt_2",
        type: "charge.dispute.created",
        data: { object: { payment_intent: booking.paymentIntentRef } },
      }),
    );
    expect(response.status).toBe(200);
    expect(bookingByReference(booking.reference)?.state).toBe("disputed");
  });

  it("settles first when the dispute arrives before payment_intent.succeeded", async () => {
    // Stripe does not order events: simulate the dispute landing while the
    // booking is still pending (payment succeeded but not yet finalized).
    const booking = await confirmedBooking();
    updateBooking(booking.id, { state: "pending" });
    const response = await POST(
      signedRequest({
        id: "evt_2b",
        type: "charge.dispute.created",
        data: { object: { payment_intent: booking.paymentIntentRef } },
      }),
    );
    expect(response.status).toBe(200);
    expect(bookingByReference(booking.reference)?.state).toBe("disputed");
  });

  it("mirrors a full refund into the state machine on charge.refunded", async () => {
    const booking = await confirmedBooking();
    const response = await POST(
      signedRequest({
        id: "evt_3",
        type: "charge.refunded",
        data: { object: { refunded: true, payment_intent: booking.paymentIntentRef } },
      }),
    );
    expect(response.status).toBe(200);
    expect(bookingByReference(booking.reference)?.state).toBe("refunded");
  });

  it("leaves the booking untouched on a partial refund", async () => {
    const booking = await confirmedBooking();
    const response = await POST(
      signedRequest({
        id: "evt_4",
        type: "charge.refunded",
        data: { object: { refunded: false, payment_intent: booking.paymentIntentRef } },
      }),
    );
    expect(response.status).toBe(200);
    expect(bookingByReference(booking.reference)?.state).toBe("confirmed");
  });
});
