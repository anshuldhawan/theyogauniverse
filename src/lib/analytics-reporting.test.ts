import { describe, expect, it } from "vitest";
import {
  assignExperiment,
  calculateDataQuality,
  calculateMarketplaceKpis,
  mayTrack,
  trackingPurposeForEvent,
  validateRankingExperiment,
  type MarketplaceEvent,
  type SupplySnapshot,
} from "./analytics-reporting";

const at = new Date("2026-07-01T00:00:00Z");

const supply: SupplySnapshot[] = [
  {
    city: "us:new-york",
    listingMode: "bookable",
    providerId: "p1",
    claimed: true,
    active: true,
    hasAvailability: true,
    publishedListings: 2,
    totalListings: 2,
    verifiedRecords: 8,
    totalRecords: 10,
    duplicateRecords: 1,
    staleRecords: 2,
  },
  {
    city: "us:new-york",
    listingMode: "bookable",
    providerId: "p2",
    claimed: false,
    active: false,
    hasAvailability: false,
    publishedListings: 1,
    totalListings: 2,
    verifiedRecords: 2,
    totalRecords: 5,
    duplicateRecords: 0,
    staleRecords: 1,
  },
  {
    city: "gb:london",
    listingMode: "advertising_only",
    providerId: "p3",
    claimed: true,
    active: true,
    hasAvailability: true,
    publishedListings: 1,
    totalListings: 1,
    verifiedRecords: 3,
    totalRecords: 6,
    duplicateRecords: 1,
    staleRecords: 3,
  },
];

function event(input: Partial<MarketplaceEvent> & Pick<MarketplaceEvent, "name">): MarketplaceEvent {
  return { at, listingMode: "bookable", ...input };
}

describe("calculateMarketplaceKpis (ANL-2)", () => {
  it("calculates marketplace, geography, payment risk, cohort and reach KPIs", () => {
    const events: MarketplaceEvent[] = [
      event({ name: "impression" }),
      event({ name: "impression" }),
      event({ name: "profile_view" }),
      event({ name: "booking_started" }),
      event({ name: "booking_details_completed" }),
      event({ name: "payment_started" }),
      event({
        name: "booking_confirmed",
        providerId: "p1",
        buyerId: "b1",
        buyerCountry: "GB",
        issuerCountry: "GB",
        listingType: "retreat",
        amountMinor: 10_000,
        commissionMinor: 1_200,
        cohort: "2026-Q3",
      }),
      event({
        name: "booking_confirmed",
        providerId: "p1",
        buyerId: "b1",
        buyerCountry: "GB",
        issuerCountry: "GB",
        listingType: "retreat",
        amountMinor: 5_000,
        commissionMinor: 600,
        cohort: "2026-Q3",
      }),
      event({ name: "review_submitted" }),
      event({ name: "booking_cancelled" }),
      event({ name: "payment_authorised", issuerCountry: "GB" }),
      event({ name: "payment_declined", issuerCountry: "GB" }),
      event({ name: "three_ds_challenged", issuerCountry: "GB" }),
      event({ name: "three_ds_failed", issuerCountry: "GB" }),
      event({ name: "dispute_opened", issuerCountry: "GB", listingType: "retreat" }),
      event({ name: "acquisition_cost", cohort: "2026-Q3", buyerId: "b1", amountMinor: 2_000 }),
      event({
        name: "impression",
        listingMode: "advertising_only",
        city: "gb:london",
        amountMinor: 999_999,
      }),
      event({ name: "profile_view", listingMode: "advertising_only", city: "gb:london" }),
      event({ name: "outbound_contact", listingMode: "advertising_only", city: "gb:london" }),
      // This illegal post-contact observation is discarded at the reporting boundary.
      event({
        name: "booking_confirmed",
        listingMode: "advertising_only",
        city: "gb:london",
        amountMinor: 1_000_000,
      }),
    ];

    const result = calculateMarketplaceKpis(events, supply);
    expect(result).toMatchObject({
      gmvMinor: 15_000,
      commissionMinor: 1_800,
      takeRate: 0.12,
      bookings: 2,
      liquidity: { numerator: 1, denominator: 2, rate: 0.5 },
      providerActivationRate: { numerator: 1, denominator: 2, rate: 0.5 },
      claimRateByProviderCountry: {
        US: { numerator: 1, denominator: 2, rate: 0.5 },
        nonUS: { numerator: 1, denominator: 1, rate: 1 },
      },
      repeatBookingRate: { numerator: 1, denominator: 1, rate: 1 },
      cancellationNoShowRate: { numerator: 1, denominator: 2, rate: 0.5 },
      buyerCountryGmv: { GB: 15_000 },
      authorisationByIssuerCountry: {
        GB: { numerator: 1, denominator: 2, rate: 0.5 },
      },
      threeDsByNonUsIssuerCountry: {
        GB: {
          challengeRate: { numerator: 1, denominator: 2, rate: 0.5 },
          failureRate: { numerator: 1, denominator: 1, rate: 1 },
        },
      },
      disputeByIssuerCountryAndListingType: {
        "GB:retreat": { numerator: 1, denominator: 2, rate: 0.5 },
      },
      cacLtvByCohort: { "2026-Q3": { cacMinor: 2_000, ltvMinor: 15_000 } },
      advertisingOnlyReach: {
        "gb:london": { impressions: 1, profileViews: 1, outboundContacts: 1 },
      },
    });
    expect(result.conversionByStep.impression_to_profile_view).toEqual({
      numerator: 1,
      denominator: 2,
      rate: 0.5,
    });
    expect(result.supplyCoverageByCity).toEqual({ "us:new-york": 1, "gb:london": 1 });
  });

  it("returns null, never NaN, when a rate has no denominator", () => {
    const result = calculateMarketplaceKpis([], []);
    expect(result.takeRate).toBeNull();
    expect(result.claimRate.rate).toBeNull();
    expect(result.repeatBookingRate.rate).toBeNull();
  });
});

describe("calculateDataQuality (ANL-3)", () => {
  it("reports transactional and advertising-only cities separately", () => {
    const result = calculateDataQuality(supply);
    expect(result.transactional).toEqual([
      {
        city: "us:new-york",
        listingMode: "bookable",
        coverage: 0.75,
        freshnessRate: 0.8,
        verificationRate: 10 / 15,
        duplicateRate: 1 / 15,
      },
    ]);
    expect(result.advertisingOnly).toEqual([
      {
        city: "gb:london",
        listingMode: "advertising_only",
        coverage: 1,
        freshnessRate: 0.5,
        verificationRate: 0.5,
        duplicateRate: 1 / 6,
      },
    ]);
  });
});

describe("server-side experimentation (ANL-4)", () => {
  const experiment = {
    key: "ranking-transactability-demotion",
    version: "2026-07.1",
    allocation: 1,
    variants: [
      { key: "control", weight: 0.5, value: 0.8 },
      { key: "treatment", weight: 0.5, value: 0.85 },
    ],
  } as const;

  it("assigns a stable variant by subject and version", () => {
    const first = assignExperiment(experiment, "buyer-123");
    expect(first).toEqual(assignExperiment(experiment, "buyer-123"));
    expect(first.assigned).toBe(true);
  });

  it("supports holdouts and validates the disclosed SRCH-16 band", () => {
    expect(assignExperiment({ ...experiment, allocation: 0 }, "buyer-123")).toEqual({
      assigned: false,
    });
    expect(() => validateRankingExperiment(experiment)).not.toThrow();
    expect(() =>
      validateRankingExperiment({
        ...experiment,
        variants: [
          { key: "control", weight: 0.5, value: 0.79 },
          { key: "treatment", weight: 0.5, value: 0.85 },
        ],
      }),
    ).toThrow(/0.80–0.85/);
  });
});

describe("consent-aware tracking (ANL-5)", () => {
  it("blocks EU/UK analytics and marketing until affirmative consent", () => {
    expect(mayTrack("essential", "EU_UK", null)).toBe(true);
    expect(mayTrack("analytics", "EU_UK", null)).toBe(false);
    expect(
      mayTrack("analytics", "EU_UK", {
        analytics: true,
        marketing: false,
        capturedAt: at,
      }),
    ).toBe(true);
    expect(
      mayTrack("marketing", "EU_UK", {
        analytics: true,
        marketing: false,
        capturedAt: at,
      }),
    ).toBe(false);
  });

  it("classifies transaction telemetry as essential", () => {
    expect(trackingPurposeForEvent("booking_confirmed")).toBe("essential");
    expect(trackingPurposeForEvent("profile_view")).toBe("analytics");
  });
});
