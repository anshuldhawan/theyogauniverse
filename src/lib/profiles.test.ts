import { describe, expect, it } from "vitest";
import {
  affiliationIsActive,
  endAffiliation,
  generateProviderSlug,
  normalizeCustomDomain,
  previewPath,
  profileCompleteness,
  teacherProfileDetailsSchema,
} from "./profiles";

describe("provider profile domain (PRO)", () => {
  it("generates deterministic collision-safe slugs (PRO-2)", () => {
    expect(generateProviderSlug("Jane Döe", "Lisbon", new Set())).toBe("jane-doe");
    expect(generateProviderSlug("Jane Doe", "Lisbon", new Set(["jane-doe"]))).toBe(
      "jane-doe-lisbon",
    );
    expect(
      generateProviderSlug(
        "Jane Doe",
        "Lisbon",
        new Set(["jane-doe", "jane-doe-lisbon", "jane-doe-lisbon-2"]),
      ),
    ).toBe("jane-doe-lisbon-3");
  });

  it("validates rich teacher fields and the 160-character short bio (PRO-4)", () => {
    const valid = {
      pronouns: "she/her",
      photoUrl: null,
      coverMediaUrl: null,
      shortBio: "Yoga teacher",
      longBio: "Longer biography",
      philosophy: "Practice with care",
      yearsTeaching: 8,
      lineage: [{ teacherOrTradition: "Iyengar", linkedProviderId: null }],
      modalities: ["yoga"],
      languages: ["en"],
      adjustmentPolicy: "Opt-in only",
      consentApproach: "Verbal consent each class",
      videoIntroductionUrl: null,
      galleryUrls: [],
    };
    expect(teacherProfileDetailsSchema.parse(valid).shortBio).toBe("Yoga teacher");
    expect(() =>
      teacherProfileDetailsSchema.parse({ ...valid, shortBio: "x".repeat(161) }),
    ).toThrow();
  });

  it("scores completeness and supplies a guided next action (PRO-9)", () => {
    expect(profileCompleteness({ name: "Ada" })).toEqual({
      score: 10,
      missing: [
        "shortBio",
        "longBio",
        "photoUrl",
        "styles",
        "languages",
        "contact",
        "scheduleCount",
        "credentialCount",
      ],
      nextAction: "shortBio",
    });
  });

  it("supports visitor previews and validates vanity domains (PRO-3/10)", () => {
    expect(previewPath("/teachers/ada")).toBe("/teachers/ada?preview=visitor");
    expect(normalizeCustomDomain(" YOGA.Example.COM. ")).toBe("yoga.example.com");
    expect(() => normalizeCustomDomain("https://example.com/path")).toThrow();
  });

  it("requires mutual confirmation and preserves ended affiliation history (PRO-12)", () => {
    const affiliation = {
      id: "a1",
      teacherProviderId: "t1",
      studioProviderId: "s1",
      confirmedByTeacherAt: new Date("2026-01-01"),
      confirmedByStudioAt: new Date("2026-01-02"),
      startedAt: new Date("2026-02-01"),
      endedAt: null,
    };
    expect(affiliationIsActive(affiliation, new Date("2026-03-01"))).toBe(true);
    const ended = endAffiliation(affiliation, new Date("2026-04-01"));
    expect(affiliationIsActive(ended, new Date("2026-05-01"))).toBe(false);
    expect(ended.id).toBe("a1");
  });
});
