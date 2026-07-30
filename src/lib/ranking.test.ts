import { describe, expect, it } from "vitest";
import { RANKING_CONFIG } from "./config/markets";
import { scoreProvider, type RankInput } from "./ranking";
import type { Provider } from "./types";

const now = new Date("2026-07-28T00:00:00Z");

function provider(overrides: Partial<Provider> = {}): Provider {
  return {
    id: "p1",
    organisationId: "o1",
    kind: "teacher",
    category: "teacher",
    slug: "p1",
    name: "Test Teacher",
    citySlug: "berlin",
    cityName: "Berlin",
    country: "DE",
    countryName: "Germany",
    onlineOnly: false,
    tagline: "",
    philosophy: "",
    bio: "",
    address: "",
    styles: [],
    levels: [],
    format: "in_person",
    yearsRunning: 10,
    reviewCount: 100,
    featured: false,
    facts: [],
    schedule: [],
    socials: [],
    reviews: [],
    verificationTier: "registry_verified",
    provenance: "seeded",
    lastVerifiedAt: "2026-07-01T00:00:00.000Z",
    confidenceScore: 0.9,
    contactEmail: null,
    website: null,
    ...overrides,
  };
}

describe("ranking service (SRCH-14 / SRCH-16)", () => {
  it("applies the fixed demotion multiplier to advertising-only listings", () => {
    const base: RankInput = {
      provider: provider(),
      transactability: "bookable",
      behavioural: null,
      relevance: 0.8,
    };
    const bookable = scoreProvider(base, now);
    const demoted = scoreProvider({ ...base, transactability: "enquiry_only" }, now);
    expect(demoted.score / bookable.score).toBeCloseTo(
      RANKING_CONFIG.advertisingOnlyMultiplier,
      10,
    );
  });

  it("keeps the multiplier inside the disclosed 15–20% band (COMP-9)", () => {
    const [low, high] = RANKING_CONFIG.advertisingOnlyMultiplierBand;
    expect(RANKING_CONFIG.advertisingOnlyMultiplier).toBeGreaterThanOrEqual(low);
    expect(RANKING_CONFIG.advertisingOnlyMultiplier).toBeLessThanOrEqual(high);
  });

  it("does NOT score missing behavioural signals as zero (SRCH-14 degradation rule)", () => {
    // An advertising-only provider with strong static signals must outrank a
    // weak transactable one — the missing behavioural signal must not
    // compound the demotion.
    const strongAdvertisingOnly = scoreProvider(
      {
        provider: provider({ verificationTier: "registry_verified", reviewCount: 300 }),
        transactability: "enquiry_only",
        behavioural: null,
        relevance: 0.8,
      },
      now,
    );
    const weakBookable = scoreProvider(
      {
        provider: provider({
          verificationTier: "self_declared",
          reviewCount: 2,
          confidenceScore: 0.3,
          lastVerifiedAt: "2025-09-01T00:00:00.000Z",
        }),
        transactability: "bookable",
        behavioural: { bookingConversion: 0.1, responseRate: 0.2, cancellationRate: 0.4 },
        relevance: 0.8,
      },
      now,
    );
    expect(strongAdvertisingOnly.score).toBeGreaterThan(weakBookable.score);
  });

  it("stamps results with the ranker version (versioned, testable service)", () => {
    const result = scoreProvider(
      { provider: provider(), transactability: "bookable", behavioural: null, relevance: 1 },
      now,
    );
    expect(result.rankerVersion).toBe(RANKING_CONFIG.version);
  });
});
