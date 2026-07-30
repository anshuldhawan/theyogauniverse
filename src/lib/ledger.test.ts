import { describe, expect, it } from "vitest";
import {
  assertBalanced,
  postBookingCapture,
  postEscrowRelease,
  postRefund,
  UnbalancedTransactionError,
} from "./ledger";
import { money } from "./money";

describe("double-entry ledger (PAY-14)", () => {
  it("rejects unbalanced transactions", () => {
    expect(() =>
      assertBalanced([
        { account: "cash", direction: "debit", amount: money(100, "USD") },
        { account: "platform_commission", direction: "credit", amount: money(90, "USD") },
      ]),
    ).toThrow(UnbalancedTransactionError);
  });

  it("rejects mixed-currency transactions", () => {
    expect(() =>
      assertBalanced([
        { account: "cash", direction: "debit", amount: money(100, "USD") },
        { account: "platform_commission", direction: "credit", amount: money(100, "EUR") },
      ]),
    ).toThrow(UnbalancedTransactionError);
  });

  it("posts a balanced high-frequency capture (5% commission)", () => {
    // $24 class: $1.20 commission, $22.80 owed to provider immediately.
    const txn = postBookingCapture({
      transactionId: "t1",
      bookingId: "b1",
      organisationId: "org-koji",
      gross: money(2400, "USD"),
      commission: money(120, "USD"),
      tax: money(0, "USD"),
      held: false,
    });
    const provider = txn.legs.find((l) => l.account === "provider_payable_available");
    expect(provider?.amount.amount).toBe(2280);
    expect(txn.legs.find((l) => l.account === "provider_payable_held")).toBeUndefined();
  });

  it("holds high-ticket funds and releases them at event start (PAY-8)", () => {
    // $3,000 retreat: 12% = $360 commission, $2,640 held.
    const capture = postBookingCapture({
      transactionId: "t2",
      bookingId: "b2",
      organisationId: "org-r",
      gross: money(300_000, "USD"),
      commission: money(36_000, "USD"),
      tax: money(0, "USD"),
      held: true,
    });
    const held = capture.legs.find((l) => l.account === "provider_payable_held");
    expect(held?.amount.amount).toBe(264_000);

    const release = postEscrowRelease({
      transactionId: "t3",
      bookingId: "b2",
      organisationId: "org-r",
      amount: money(264_000, "USD"),
    });
    expect(release.legs).toHaveLength(2);
  });

  it("refund reverses the capture exactly", () => {
    const txn = postRefund({
      transactionId: "t4",
      bookingId: "b1",
      organisationId: "org-koji",
      gross: money(2400, "USD"),
      commission: money(120, "USD"),
      tax: money(0, "USD"),
      wasHeld: false,
    });
    const cash = txn.legs.find((l) => l.account === "cash");
    expect(cash?.direction).toBe("credit");
    expect(cash?.amount.amount).toBe(2400);
  });
});
