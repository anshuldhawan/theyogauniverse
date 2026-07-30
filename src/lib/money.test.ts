import { describe, expect, it } from "vitest";
import {
  add,
  formatMoney,
  formatPriceRange,
  fromMajor,
  money,
  percentageBps,
} from "./money";

describe("money (DM-4)", () => {
  it("rejects non-integer minor units", () => {
    expect(() => money(10.5, "USD")).toThrow();
  });

  it("rejects malformed currency codes", () => {
    expect(() => money(100, "usd")).toThrow();
    expect(() => money(100, "US")).toThrow();
  });

  it("handles zero-exponent currencies (JPY)", () => {
    expect(fromMajor(2200, "JPY").amount).toBe(2200);
    expect(fromMajor(24, "USD").amount).toBe(2400);
  });

  it("refuses cross-currency arithmetic", () => {
    expect(() => add(money(100, "USD"), money(100, "EUR"))).toThrow();
  });

  it("computes commission in basis points (PAY-5)", () => {
    // 12% of $3,000.00
    expect(percentageBps(money(300_000, "USD"), 1200).amount).toBe(36_000);
    // 5% of $24.00 = $1.20
    expect(percentageBps(money(2_400, "USD"), 500).amount).toBe(120);
    // rounding: 5% of $24.99 = $1.2495 -> $1.25
    expect(percentageBps(money(2_499, "USD"), 500).amount).toBe(125);
  });

  it("formats for display", () => {
    expect(formatMoney(money(2400, "USD"))).toBe("$24");
    expect(formatMoney(money(2450, "USD"))).toBe("$24.50");
  });

  it("formats indicative ranges (LST-14)", () => {
    const range = { low: money(1200, "EUR"), high: money(2000, "EUR") };
    expect(formatPriceRange(range)).toBe("€12–€20");
  });
});
