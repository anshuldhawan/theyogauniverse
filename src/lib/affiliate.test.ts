import { afterEach, describe, expect, it, vi } from "vitest";
import { createAffiliateAttribution, readAffiliateAttribution } from "./affiliate";
import { travelInsuranceReferral } from "./travel-insurance";
import type { Listing, Organisation } from "./types";

const organisation: Organisation = {
  id: "org",
  name: "Studio",
  provenance: "native",
  payoutEligibility: {
    domicileCountry: "US",
    connectStatus: "active",
    connectAccountId: "acct_1",
  },
};

const listing: Listing = {
  id: "listing",
  providerId: "provider",
  organisationId: "org",
  type: "retreat",
  supplyType: "in_person",
  performanceCountry: "US",
  title: "Retreat",
  status: "published",
  price: null,
  indicativeRange: null,
  donationBased: false,
};

afterEach(() => vi.unstubAllEnvs());

describe("affiliate and referral enforcement (INT-9/INT-10)", () => {
  it("issues signed attribution only for allowlisted partners and bookable listings", () => {
    vi.stubEnv("AFFILIATE_PARTNERS", "partner-a");
    const token = createAffiliateAttribution({
      partner: "partner-a",
      listing,
      organisation,
      buyer: { country: "US" },
      now: 100,
    });
    expect(token).not.toBeNull();
    expect(readAffiliateAttribution(token!, 101)).toMatchObject({ listingId: "listing", partner: "partner-a" });

    const advertisingOnly = {
      ...organisation,
      payoutEligibility: { ...organisation.payoutEligibility, connectStatus: "none" as const },
    };
    expect(
      createAffiliateAttribution({
        partner: "partner-a",
        listing,
        organisation: advertisingOnly,
        buyer: { country: "US" },
      }),
    ).toBeNull();
  });

  it("offers insurance only on bookable retreats and includes no buyer PII", () => {
    vi.stubEnv("TRAVEL_INSURANCE_REFERRAL_URL", "https://insurance.example/quote");
    const url = travelInsuranceReferral({
      listing,
      organisation,
      buyer: { country: "US" },
      bookingReference: "SH-ABC123",
    });
    expect(url).toContain("listing=listing");
    expect(url).not.toContain("SH-ABC123");
    expect(travelInsuranceReferral({ listing: { ...listing, type: "workshop" }, organisation, buyer: { country: "US" } })).toBeNull();
  });
});
