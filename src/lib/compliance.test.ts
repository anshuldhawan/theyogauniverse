import { describe, expect, it } from "vitest";
import {
  dataRequestDueAt,
  evaluateSanctions,
  isAccountAgeEligible,
  mayLoadCategory,
  resolveConsent,
  taxControlExceptions,
} from "./compliance";

describe("compliance controls", () => {
  it("forces optional tracking off when GPC is present", () => {
    const consent = resolveConsent({
      analytics: true,
      marketing: true,
      globalPrivacyControl: true,
      now: new Date("2026-01-01T00:00:00Z"),
    });
    expect(consent).toMatchObject({ analytics: false, marketing: false, gpcHonoured: true });
    expect(mayLoadCategory(consent, "analytics")).toBe(false);
    expect(mayLoadCategory(null, "necessary")).toBe(true);
  });

  it("applies jurisdiction age floors", () => {
    const today = new Date("2026-07-29T12:00:00Z");
    expect(isAccountAgeEligible({ dateOfBirth: "2009-07-29", country: "GB", today })).toBe(true);
    expect(isAccountAgeEligible({ dateOfBirth: "2009-07-29", country: "US", today })).toBe(false);
    expect(isAccountAgeEligible({ dateOfBirth: "2011-07-30", country: "GB", today })).toBe(false);
  });

  it("uses a 30-day privacy request deadline", () => {
    expect(dataRequestDueAt(new Date("2026-07-01T00:00:00Z")).toISOString()).toBe(
      "2026-07-31T00:00:00.000Z",
    );
  });

  it("returns loggable sanctions outcomes", () => {
    expect(
      evaluateSanctions({
        country: "ir",
        blockedJurisdictions: new Set(["IR"]),
        listVersion: "v1",
      }),
    ).toEqual({
      outcome: "block",
      reasonCode: "blocked_jurisdiction",
      country: "IR",
      listVersion: "v1",
    });
  });

  it("flags every quarterly tax exception", () => {
    expect(
      taxControlExceptions({
        quarter: "2026-Q3",
        trackBForeignRegionsDisabled: false,
        foreignPerformanceListings: 1,
        bundledCrossBorderRetreats: 1,
        reviewedBy: null,
        reviewedAt: null,
      }),
    ).toHaveLength(4);
  });
});
