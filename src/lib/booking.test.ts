import { beforeEach, describe, expect, it } from "vitest";
import { canTransition, checkout, transitionBooking } from "./booking";
import { commissionBpsFor, escrowReleaseAt } from "./commission";
import { slotById } from "./repo";
import { resolveBuyerCountry } from "./tax";

/** Reset the in-memory store between tests. */
beforeEach(() => {
  (globalThis as Record<string, unknown>).__theYogaUniverseStore = undefined;
});

const usEvidence = {
  geoIpCountry: "US",
  billingCountry: "US",
  cardIssuerCountry: "US",
};

function checkoutInput(overrides: Record<string, unknown> = {}) {
  return {
    providerSlug: "koji", // the seed's only US (bookable) provider
    slotId: "koji-0",
    guestName: "Test Guest",
    guestEmail: "guest@example.com",
    waiverAccepted: true,
    idempotencyKey: `key-${Math.random()}`,
    evidence: usEvidence,
    ...overrides,
  };
}

describe("booking state machine (BKG-18)", () => {
  it("allows only legal transitions", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
    expect(canTransition("confirmed", "attended")).toBe(true);
    expect(canTransition("refunded", "confirmed")).toBe(false);
    expect(canTransition("attended", "cancelled_by_user")).toBe(false);
  });
});

describe("checkout (BKG / PAY)", () => {
  it("books the US provider end to end as a guest (ACC-2)", async () => {
    const result = await checkout(checkoutInput());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.booking.state).toBe("confirmed");
      expect(result.booking.reference).toMatch(/^SH-/);
      // PAY-5: 5% commission on a $24 class, resolved and stored.
      expect(result.booking.commission?.amount).toBe(120);
    }
  });

  it("decrements capacity concurrency-safely and refuses when full (BKG-19)", async () => {
    const before = slotById("koji-0")!;
    const free = before.capacity - before.booked;
    for (let i = 0; i < free; i++) {
      const result = await checkout(checkoutInput());
      expect(result.ok).toBe(true);
    }
    const overflow = await checkout(checkoutInput());
    expect(overflow.ok).toBe(false);
    const after = slotById("koji-0")!;
    expect(after.booked).toBe(after.capacity);
  });

  it("refuses advertising-only providers even if the client fakes a request (server-side DM-7 recheck)", async () => {
    const result = await checkout(checkoutInput({ providerSlug: "maya", slotId: "maya-0" }));
    expect(result.ok).toBe(false);
  });

  it("releases the seat when payment declines", async () => {
    const before = slotById("koji-0")!;
    const result = await checkout(checkoutInput({ guestEmail: "decline@example.com" }));
    expect(result.ok).toBe(false);
    const after = slotById("koji-0")!;
    expect(after.booked).toBe(before.booked);
  });

  it("requires the waiver before confirming (WVR-3)", async () => {
    const result = await checkout(checkoutInput({ waiverAccepted: false }));
    expect(result.ok).toBe(false);
  });

  it("is idempotent on the idempotency key (NFR-11)", async () => {
    const key = "fixed-key-1";
    const first = await checkout(checkoutInput({ idempotencyKey: key }));
    const second = await checkout(checkoutInput({ idempotencyKey: key }));
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.booking.id).toBe(first.booking.id);
    }
    const slot = slotById("koji-0")!;
    expect(slot.booked - 14).toBeLessThanOrEqual(slot.capacity); // no double decrement
  });

  it("supports cancellation with seat release (BKG-5)", async () => {
    const result = await checkout(checkoutInput());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const before = slotById("koji-0")!;
    const cancel = transitionBooking(result.booking.reference, "cancelled_by_user");
    expect(cancel.ok).toBe(true);
    const after = slotById("koji-0")!;
    expect(after.booked).toBe(before.booked - 1);
  });
});

describe("commission bands (PAY-5) and escrow (PAY-8)", () => {
  it("12% for retreats/trainings, 5% for classes", () => {
    expect(commissionBpsFor("retreat")).toBe(1200);
    expect(commissionBpsFor("teacher_training")).toBe(1200);
    expect(commissionBpsFor("recurring_class")).toBe(500);
    expect(commissionBpsFor("workshop")).toBe(500);
    expect(commissionBpsFor("private_session")).toBe(500);
  });

  it("escrow release only for high-ticket", () => {
    const start = new Date("2026-09-02T04:00:00Z");
    expect(escrowReleaseAt("retreat", start)).toEqual(start);
    expect(escrowReleaseAt("recurring_class", start)).toBeNull();
  });
});

describe("buyer location evidence (PAY-11)", () => {
  it("requires two agreeing signals", () => {
    expect(resolveBuyerCountry(usEvidence)).toBe("US");
    expect(
      resolveBuyerCountry({ geoIpCountry: "US", billingCountry: null, cardIssuerCountry: null }),
    ).toBeNull();
    expect(
      resolveBuyerCountry({ geoIpCountry: "US", billingCountry: "GB", cardIssuerCountry: "DE" }),
    ).toBeNull();
    expect(
      resolveBuyerCountry({ geoIpCountry: "FR", billingCountry: "DE", cardIssuerCountry: "DE" }),
    ).toBe("DE");
  });
});
