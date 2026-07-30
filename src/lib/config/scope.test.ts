import { describe, expect, it } from "vitest";
import {
  advertisingContactEvent,
  capabilityEnabled,
  isV1PayoutCountry,
  V1_SCOPE,
} from "./scope";

describe("v1 non-goal controls (NG)", () => {
  it("keeps explicitly excluded product capabilities disabled", () => {
    expect(capabilityEnabled("studio_back_office")).toBe(false);
    expect(capabilityEnabled("first_party_content_production")).toBe(false);
    expect(capabilityEnabled("subscription_aggregator")).toBe(false);
    expect(capabilityEnabled("native_mobile_app")).toBe(false);
  });

  it("allows payouts only to US-domiciled organisations", () => {
    expect(isV1PayoutCountry("us")).toBe(true);
    expect(isV1PayoutCountry("GB")).toBe(false);
    expect(V1_SCOPE.payoutCountries).toEqual(["US"]);
  });

  it("does not gate discovery on transactability", () => {
    expect(V1_SCOPE.discoveryRequiresTransactability).toBe(false);
  });

  it("builds a deliberately outcome-free advertising contact event", () => {
    const event = advertisingContactEvent("provider-1", "listing-1");
    expect(event).toEqual({
      name: "advertising_contact_outbound",
      providerId: "provider-1",
      listingId: "listing-1",
    });
    expect(event).not.toHaveProperty("amount");
    expect(event).not.toHaveProperty("outcome");
    expect(V1_SCOPE.offPlatformCommerce).toEqual({
      fee: false,
      affiliateRevenue: false,
      leadCharge: false,
      outcomeTracking: false,
    });
  });
});
