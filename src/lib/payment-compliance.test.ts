import { describe, expect, it } from "vitest";
import { money } from "./money";
import { allocateRefund, createTrackAReceipt, reportingRegimesForV1 } from "./payment-compliance";

describe("payment and tax compliance", () => {
  it("separates provider, buyer and goodwill refund accounting (PAY-9)", () => {
    const gross = money(10_000, "USD");
    const commission = money(500, "USD");
    expect(allocateRefund(money(5_000, "USD"), commission, gross, "provider_fault")).toMatchObject({
      providerDebit: money(4_750, "USD"), commissionReversal: money(250, "USD"),
    });
    expect(allocateRefund(money(5_000, "USD"), commission, gross, "buyer_fault")).toMatchObject({
      providerDebit: money(5_000, "USD"), commissionReversal: money(0, "USD"),
    });
    expect(allocateRefund(money(5_000, "USD"), commission, gross, "platform_goodwill")).toMatchObject({
      providerDebit: money(0, "USD"), platformExpense: money(5_000, "USD"),
    });
  });

  it("limits built reporting to US 1099-K transactions (PAY-12)", () => {
    expect(reportingRegimesForV1({ providerCountry: "US", transactedOnPlatform: true })).toEqual(["1099-K"]);
    expect(reportingRegimesForV1({ providerCountry: "DE", transactedOnPlatform: false })).toEqual([]);
  });

  it("creates localised Track A receipts for non-US buyers (PAY-13)", () => {
    const receipt = createTrackAReceipt({
      receiptNumber: "R-1", buyerLocale: "de-DE", buyerCountry: "DE",
      performanceCountry: "US", supplyType: "in_person", subtotal: money(10_000, "USD"),
      tax: money(887, "USD"), providerName: "Studio",
    });
    expect(receipt.total).toContain("108,87");
    expect(receipt.taxNote).toContain("No local VAT or GST");
  });
});
