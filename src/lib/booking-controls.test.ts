import { describe, expect, it } from "vitest";
import { money } from "./money";
import {
  cartTotal,
  introOfferEligible,
  nextPaymentFailureAction,
  resolveWaitlistOffer,
  reschedule,
  reviewBookingRequest,
  validateAttendees,
  validateCorporateBooking,
} from "./booking-controls";

describe("booking lifecycle controls", () => {
  it("totals multi-item carts with a currency guard (BKG-2)", () => {
    expect(cartTotal([
      { id: "class", kind: "booking", quantity: 1, unitPrice: money(2400, "USD") },
      { id: "mat", kind: "mat_hire", quantity: 2, unitPrice: money(300, "USD") },
    ])?.amount).toBe(3000);
    expect(cartTotal([{ id: "x", kind: "other", quantity: 1, unitPrice: money(1, "EUR") }, { id: "y", kind: "other", quantity: 1, unitPrice: money(1, "USD") }])).toBeNull();
  });

  it("requires a waiver for every group attendee (BKG-5)", () => {
    expect(validateAttendees([{ name: "A", waiverSignatureId: "sig-a" }, { name: "B", waiverSignatureId: null }])).toEqual(["Attendee 2 must sign a waiver."]);
  });

  it("accepts applications before exposing payment (BKG-1/10)", () => {
    const request = { state: "submitted" as const, questionnaire: { why: "Learn" }, submittedAt: new Date("2026-07-01"), expiresAt: new Date("2026-08-01"), paymentLink: null };
    expect(reviewBookingRequest(request, "accept", "/pay/1", new Date("2026-07-02"))).toMatchObject({ state: "accepted", paymentLink: "/pay/1" });
    expect(request.paymentLink).toBeNull();
  });

  it("supports policy-gated atomic rescheduling (BKG-7)", () => {
    expect(reschedule({ allowed: true, currentOccurrenceId: "a", targetOccurrenceId: "b", targetSeatsAvailable: 1, priceDifference: money(500, "USD") })).toEqual({
      ok: true, amountDue: money(500, "USD"), releaseOccurrenceId: "a",
    });
  });

  it("handles both waitlist response modes and expiry (BKG-4)", () => {
    const offeredAt = new Date("2026-07-01T10:00:00Z");
    const expiresAt = new Date("2026-07-01T12:00:00Z");
    expect(resolveWaitlistOffer({ mode: "auto_charge", offeredAt, expiresAt, state: "offered" }, new Date("2026-07-01T11:00:00Z"), false).state).toBe("charged");
    expect(resolveWaitlistOffer({ mode: "hold_and_confirm", offeredAt, expiresAt, state: "offered" }, new Date("2026-07-01T13:00:00Z"), true).state).toBe("expired");
  });

  it("schedules retries then applies configured dunning outcome (BKG-8/9)", () => {
    const policy = { retryAfterDays: [1, 3], autoCancelOnFailure: true };
    expect(nextPaymentFailureAction(policy, 0, new Date("2026-07-01")).action).toBe("retry");
    expect(nextPaymentFailureAction(policy, 2, new Date("2026-07-01")).action).toBe("cancel");
  });

  it("enforces intro eligibility across linked identities (BKG-12)", () => {
    const claims = [{ offerId: "intro", userKey: "card:abc" }];
    expect(introOfferEligible("intro", ["email:a@x.com", "card:abc"], claims)).toBe(false);
    expect(introOfferEligible("intro", ["email:b@x.com"], claims)).toBe(true);
  });

  it("gates corporate checkout and invoice terms (BKG-15)", () => {
    expect(validateCorporateBooking({ transactability: "enquiry_only", seats: 5, availableSeats: 10, invoiceTermsDays: 30 })).toHaveLength(2);
    expect(validateCorporateBooking({ transactability: "bookable", seats: 5, availableSeats: 10, invoiceTermsDays: 30, purchaseOrderReference: "PO-1" })).toEqual([]);
  });
});
