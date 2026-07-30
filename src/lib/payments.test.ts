import { describe, expect, it } from "vitest";
import { paymentProvider, stripePaymentMethodTypes } from "./payments";

describe("PAY-19 — payment method resolution by buyer region", () => {
  it("US buyers get card + link + ACH (wallets ride on card)", () => {
    expect(stripePaymentMethodTypes("US")).toEqual(["card", "link", "us_bank_account"]);
  });

  it("EU buyers get card + link + klarna", () => {
    expect(stripePaymentMethodTypes("DE")).toEqual(["card", "link", "klarna"]);
    expect(stripePaymentMethodTypes("FR")).toEqual(["card", "link", "klarna"]);
  });

  it("GB buyers get card + link + klarna, AU card + link", () => {
    expect(stripePaymentMethodTypes("GB")).toEqual(["card", "link", "klarna"]);
    expect(stripePaymentMethodTypes("AU")).toEqual(["card", "link"]);
  });

  it("unknown or missing region falls back to the default set", () => {
    expect(stripePaymentMethodTypes("BR")).toEqual(["card", "link"]);
    expect(stripePaymentMethodTypes(null)).toEqual(["card", "link"]);
  });
});

describe("PAY-1 — rail selection", () => {
  it("uses the mock rail when Stripe keys are absent (CI)", () => {
    expect(paymentProvider().name).toBe("mock");
  });
});
