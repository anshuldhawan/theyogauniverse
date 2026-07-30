import { describe, expect, it } from "vitest";
import {
  addFollow,
  buildAccountExport,
  canPerformVerifiedAction,
  mergeAccounts,
  identityCapability,
  practitionerProfileSchema,
  publicCollectionPath,
  saveListing,
  sessionMeetsRolePolicy,
} from "./accounts";

describe("account controls (ACC)", () => {
  it("requires verified email for claims and reviews (ACC-4)", () => {
    expect(canPerformVerifiedAction(null, "claim_profile")).toBe(false);
    expect(canPerformVerifiedAction(new Date(), "post_review")).toBe(true);
  });

  it("requires a second factor for organisation owners/admins (ACC-7)", () => {
    expect(sessionMeetsRolePolicy("owner", false)).toBe(false);
    expect(sessionMeetsRolePolicy("admin", true)).toBe(true);
    expect(sessionMeetsRolePolicy("manager", false)).toBe(true);
  });

  it("allows listing before KYC but gates payout and non-US traceability (ACC-5)", () => {
    expect(identityCapability("US", "not_started")).toEqual({
      mayList: true,
      mayReceivePayout: false,
      traceabilitySatisfied: false,
    });
    expect(identityCapability("US", "kyc_verified").mayReceivePayout).toBe(true);
    expect(identityCapability("DE", "traceability_verified")).toEqual({
      mayList: true,
      mayReceivePayout: false,
      traceabilitySatisfied: true,
    });
  });

  it("merges identities only on the same verified email (ACC-6)", () => {
    const first = {
      id: "a",
      verifiedEmail: "Person@Example.com",
      providerIds: ["google"],
      createdAt: new Date("2026-01-01"),
    };
    const second = {
      id: "b",
      verifiedEmail: "person@example.com",
      providerIds: ["apple"],
      createdAt: new Date("2026-02-01"),
    };
    expect(mergeAccounts(first, second)).toMatchObject({
      id: "a",
      verifiedEmail: "person@example.com",
      providerIds: ["google", "apple"],
    });
    expect(() => mergeAccounts(first, { ...second, verifiedEmail: null })).toThrow(
      "same verified email",
    );
  });

  it("validates the practitioner profile and protects encrypted health data (ACC-11)", () => {
    const profile = practitionerProfileSchema.parse({
      preferredStyles: ["yin"],
      experienceLevel: "beginner",
      injuriesCiphertext: "encrypted-value",
      preferredLanguages: ["en"],
      homeCity: "london",
      timezone: "Europe/London",
      billingCountry: "GB",
    });
    expect(profile.billingCountry).toBe("GB");
    expect(() =>
      practitionerProfileSchema.parse({ ...profile, timezone: "GMT+2" }),
    ).toThrow();

    const exported = buildAccountExport({
      generatedAt: new Date("2026-07-01T00:00:00Z"),
      profile,
      follows: [],
      collections: [],
    });
    expect(exported.profile).not.toHaveProperty("injuriesCiphertext");
  });

  it("deduplicates follows and saves, exposing only opted-in collections (ACC-9/10)", () => {
    const follow = { subjectType: "teacher" as const, subjectId: "teacher-1" };
    expect(addFollow(addFollow([], follow), follow)).toHaveLength(1);

    const privateCollection = {
      id: "c1",
      name: "Weekend",
      publicToken: null,
      listingIds: [],
    };
    const saved = saveListing(saveListing(privateCollection, "l1"), "l1");
    expect(saved.listingIds).toEqual(["l1"]);
    expect(publicCollectionPath(saved)).toBeNull();
    expect(publicCollectionPath({ ...saved, publicToken: "share-me" })).toBe(
      "/saved/share-me",
    );
  });
});
