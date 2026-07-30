import { describe, expect, it, vi } from "vitest";
import { deliverBookingWebhooks, enqueueBookingWebhook, webhookSignature } from "./partner-webhooks";
import type { Booking } from "./types";

const booking: Booking = {
  id: "booking-1",
  reference: "SH-ABC123",
  slotId: "slot",
  providerId: "provider",
  listingId: "listing",
  state: "confirmed",
  guestName: "Guest",
  guestEmail: "guest@example.com",
  price: null,
  commission: null,
  paymentIntentRef: null,
  createdAt: "2026-07-29T00:00:00.000Z",
  waiverVersion: "v1",
};

describe("partner lifecycle webhooks (INT-8)", () => {
  it("signs and delivers a PII-minimised versioned event", async () => {
    enqueueBookingWebhook(booking);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    const now = Date.now() + 1;
    const result = await deliverBookingWebhooks({
      endpoint: "https://partner.example/webhooks",
      secret: "secret",
      fetch: fetcher,
      now,
    });
    expect(result.delivered).toBe(1);
    const init = fetcher.mock.calls[0][1]!;
    const payload = String(init.body);
    expect(payload).not.toContain("guest@example.com");
    expect(payload).toContain('"apiVersion":"2026-07-01"');
    expect((init.headers as Record<string, string>)["X-Yoga-Webhook-Signature"]).toBe(
      `v1=${webhookSignature(payload, Math.floor(now / 1000), "secret")}`,
    );
  });
});
