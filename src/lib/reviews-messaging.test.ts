import { beforeEach, describe, expect, it } from "vitest";
import { checkout } from "./booking";
import { transitionBooking } from "./booking";
import { maskContactDetails, maskingApplies, responseStats } from "./messaging";
import { canPublishAggregate, validateReview } from "./reviews";

beforeEach(() => {
  (globalThis as Record<string, unknown>).__theYogaUniverseStore = undefined;
});

async function makeBooking() {
  const result = await checkout({
    providerSlug: "koji",
    slotId: "koji-1",
    guestName: "Reviewer",
    guestEmail: "reviewer@example.com",
    waiverAccepted: true,
    idempotencyKey: crypto.randomUUID(),
    evidence: { geoIpCountry: "US", billingCountry: "US", cardIssuerCountry: "US" },
  });
  if (!result.ok) throw new Error("setup booking failed");
  const attended = transitionBooking(result.booking.reference, "attended");
  if (!attended.ok) throw new Error("setup attendance transition failed");
  return result.booking;
}

describe("verified reviews (REV-1/3/8)", () => {
  it("accepts a review from the verified attendee", async () => {
    const booking = await makeBooking();
    const validation = validateReview({
      bookingReference: booking.reference,
      guestEmail: "reviewer@example.com",
      ratings: { teaching_quality: 5, value: 4 },
      text: "Precise, demanding and kind. The led primary rebuilt my breath count.",
    });
    expect(validation).toEqual({ ok: true });
  });

  it("rejects reviews without a matching booking or from another email", async () => {
    const booking = await makeBooking();
    expect(
      validateReview({
        bookingReference: "SH-NOPE99",
        guestEmail: "reviewer@example.com",
        ratings: { teaching_quality: 5 },
        text: "This should not pass because there is no booking.",
      }).ok,
    ).toBe(false);
    expect(
      validateReview({
        bookingReference: booking.reference,
        guestEmail: "someone-else@example.com",
        ratings: { teaching_quality: 5 },
        text: "This should not pass because the email does not match.",
      }).ok,
    ).toBe(false);
  });

  it("requires multi-dimensional integer ratings 1..5", async () => {
    const booking = await makeBooking();
    expect(
      validateReview({
        bookingReference: booking.reference,
        guestEmail: "reviewer@example.com",
        ratings: {},
        text: "No ratings supplied so this must fail validation.",
      }).ok,
    ).toBe(false);
    expect(
      validateReview({
        bookingReference: booking.reference,
        guestEmail: "reviewer@example.com",
        ratings: { teaching_quality: 6 },
        text: "Rating out of range so this must fail validation.",
      }).ok,
    ).toBe(false);
  });

  it("suppresses aggregates below the minimum sample (REV-8)", () => {
    expect(canPublishAggregate(2)).toBe(false);
    expect(canPublishAggregate(3)).toBe(true);
  });
});

describe("contact masking (MSG-2)", () => {
  it("masks emails, phones and URLs in transactable threads", () => {
    const masked = maskContactDetails(
      "Email me at yogi@example.com or call +1 (212) 555-0147, or see https://example.com/book",
      "bookable",
    );
    expect(masked).not.toContain("yogi@example.com");
    expect(masked).not.toContain("555");
    expect(masked).not.toContain("https://example.com");
  });

  it("NEVER masks advertising-only contact (the product is the contact)", () => {
    const text = "Email me at yogi@example.com";
    expect(maskContactDetails(text, "enquiry_only")).toBe(text);
    expect(maskingApplies("enquiry_only")).toBe(false);
  });
});

describe("response stats (MSG-3 → SRCH-14)", () => {
  it("computes response rate and median response time", () => {
    const now = Date.now();
    const stats = responseStats([
      { providerId: "p", createdAt: new Date(now), respondedAt: new Date(now + 2 * 3_600_000) },
      { providerId: "p", createdAt: new Date(now), respondedAt: new Date(now + 6 * 3_600_000) },
      { providerId: "p", createdAt: new Date(now), respondedAt: null },
    ]);
    expect(stats.responseRate).toBeCloseTo(2 / 3);
    expect(stats.medianResponseHours).toBe(4);
  });
});
