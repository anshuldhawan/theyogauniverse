import { describe, expect, it } from "vitest";
import {
  chooseCommercialMode,
  createTeamInvite,
  nextOnboardingStep,
  studentCrm,
  validateProviderPolicies,
  visibleMarketingTools,
} from "./dashboard";
import {
  confidenceForCandidate,
  freshnessDisposition,
  sourceMayRun,
  stageCandidate,
  type CandidateRecord,
} from "./ingestion";
import {
  antiCircumventionSignals,
  broadcastAudience,
  defaultNotificationPreferences,
  marketingAllowed,
  notificationPermitted,
  unsubscribeMarketing,
} from "./messaging";
import {
  assessClaimIdentity,
  decideStandingAppeal,
  fileStandingAppeal,
  minorsVerificationRequired,
  moderateContent,
  triageReport,
  type ProviderCase,
} from "./moderation";
import {
  assessReviewFraud,
  canEditReview,
  displayReviewTranslation,
  reviewAttribution,
  reviewRecencyWeight,
  reviewWindow,
} from "./reviews";
import {
  breadcrumbSchema,
  localeAlternates,
  paginationLinks,
  resolveRedirect,
  webVitalsRegressions,
} from "./seo";

describe("review lifecycle and fraud controls", () => {
  it("enforces the delayed and finite review window", () => {
    const occurred = new Date("2026-01-01T10:00:00Z");
    expect(reviewWindow(occurred, new Date("2026-01-02T09:59:00Z")).open).toBe(false);
    expect(reviewWindow(occurred, new Date("2026-01-02T10:00:00Z")).open).toBe(true);
    expect(reviewWindow(occurred, new Date("2026-02-01T10:00:01Z")).open).toBe(false);
  });

  it("attributes substitutions and detects explainable fraud", () => {
    expect(
      reviewAttribution({
        listingId: "l",
        teacherProviderId: "original",
        studioProviderId: "studio",
        substituteProviderId: "substitute",
      }).teacherProviderId,
    ).toBe("substitute");
    const fraud = assessReviewFraud({
      reviewsFromIp24h: 6,
      reviewsFromDevice24h: 1,
      textReuseSimilarity: 0.9,
      discountMentioned: false,
      providerLinkedAccount: false,
    });
    expect(fraud.decision).toBe("review");
    expect(fraud.reasons).toContain("text_reuse");
  });

  it("supports edit expiry, recency decay and labelled translations", () => {
    const createdAt = new Date("2026-01-01T00:00:00Z");
    expect(canEditReview({ createdAt }, new Date("2026-01-01T23:59:00Z"))).toBe(true);
    expect(canEditReview({ createdAt }, new Date("2026-01-02T00:01:00Z"))).toBe(false);
    expect(reviewRecencyWeight(createdAt, new Date("2026-07-01T00:00:00Z"))).toBeLessThan(0.51);
    const display = displayReviewTranslation({
      originalText: "Excelente clase",
      originalLanguage: "es",
      requestedLanguage: "en",
      translatedText: "Excellent class",
    });
    expect(display.machineTranslated).toBe(true);
    expect(display.originalText).toBe("Excelente clase");
  });
});

describe("notification consent and scope", () => {
  it("defaults marketing off and preserves transactional email on unsubscribe", () => {
    const preferences = defaultNotificationPreferences();
    expect(marketingAllowed(preferences, "email", "classes")).toBe(false);
    preferences.marketing.email.classes = true;
    expect(marketingAllowed(preferences, "email", "classes")).toBe(true);
    const unsubscribed = unsubscribeMarketing(preferences, new Date());
    expect(marketingAllowed(unsubscribed, "email", "classes")).toBe(false);
    expect(
      notificationPermitted({
        event: "booking_confirmed",
        transactability: "bookable",
        channel: "email",
        preferences: unsubscribed,
      }),
    ).toBe(true);
  });

  it("limits advertising-only notifications and broadcasts", () => {
    const preferences = defaultNotificationPreferences();
    expect(
      notificationPermitted({
        event: "message_forwarded",
        transactability: "enquiry_only",
        channel: "email",
        preferences,
      }),
    ).toBe(true);
    expect(
      notificationPermitted({
        event: "review_request",
        transactability: "enquiry_only",
        channel: "email",
        preferences,
      }),
    ).toBe(false);
    expect(
      broadcastAudience("p", "enquiry_only", [
        { userId: "u", providerId: "p", hasCompletedBooking: true },
      ]),
    ).toEqual([]);
    expect(antiCircumventionSignals("pay at https://other.test", "bookable").hardBlock).toBe(false);
  });
});

describe("ingestion safety and provenance", () => {
  const candidate: CandidateRecord = {
    name: "Moksha Yoga",
    citySlug: "london",
    country: "GB",
    sourceUrl: "https://source.test/moksha",
    contactEmail: "hello@moksha.test",
    fetchedAt: "2026-01-01T00:00:00Z",
    website: "https://moksha.test",
    schedule: [{ day: "Monday" }],
    price: 20,
    images: ["https://source.test/image.jpg"],
  };

  it("blocks prohibited sources and strips non-durable fields", () => {
    expect(
      sourceMayRun({
        sourceId: "x",
        baseUrl: "https://x.test",
        robotsAllowed: false,
        termsPermitIngestion: true,
        requestsPerMinute: 10,
        reviewedAt: "2026-01-01",
        notes: "",
      }).allowed,
    ).toBe(false);
    const staged = stageCandidate(candidate, [], {
      sourceUrl: candidate.sourceUrl,
      method: "crawler",
      observedAt: candidate.fetchedAt,
      agentVersion: "1.2.0",
    });
    expect(staged.status).toBe("publishable");
    expect(staged.rejectedFields).toEqual(["schedule", "price", "images"]);
    expect(staged.fieldProvenance.name.agentVersion).toBe("1.2.0");
    expect(staged.payload.schedule).toBeUndefined();
  });

  it("scores confidence and weights freshness against advertising-only records", () => {
    expect(confidenceForCandidate(candidate, { kind: "new" })).toBeGreaterThanOrEqual(0.75);
    expect(
      freshnessDisposition({
        provenance: "seeded",
        lastVerifiedAt: new Date("2026-01-01"),
        now: new Date("2026-04-01"),
        advertisingOnly: true,
        signals: { websiteReachable: true, businessOpen: true, socialActiveAt: new Date("2026-03-01") },
      }),
    ).toBe("demote");
  });
});

describe("trust, safety and appeals", () => {
  it("urgently escalates safeguarding and screens scams", () => {
    const triage = triageReport({ reason: "safeguarding" });
    expect(triage.suspendPendingReview).toBe(true);
    expect(triage.requiresLegalReview).toBe(true);
    expect(moderateContent("Send a wire transfer and your password").decision).toBe("human_review");
  });

  it("runs an audited suspension appeal", () => {
    const base: ProviderCase = {
      id: "case-1",
      providerId: "provider-1",
      standing: "suspended",
      events: [],
    };
    const appealed = fileStandingAppeal(base, {
      filedAt: new Date(),
      statement: "The evidence concerns another provider.",
      evidenceRefs: ["evidence-1"],
    });
    const decided = decideStandingAppeal(appealed, {
      actor: "senior-reviewer",
      outcome: "overturned",
      reason: "identity mismatch confirmed",
      at: new Date(),
    });
    expect(decided.standing).toBe("active");
    expect(decided.events).toHaveLength(1);
  });

  it("detects contested claims and jurisdiction checks for minors", () => {
    expect(
      assessClaimIdentity({
        providerId: "p",
        claimantId: "new",
        identityMethod: "email_domain",
        evidenceRefs: ["email-proof"],
        existingClaimantIds: ["existing"],
      }).status,
    ).toBe("contested");
    expect(
      minorsVerificationRequired({ offersMinorsClasses: true, country: "GB", checks: [] }),
    ).toEqual({ publishable: false, requiredCheck: "DBS" });
  });
});

describe("SEO primitives", () => {
  it("emits complete breadcrumbs, pagination and language alternates", () => {
    const schema = breadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "London", href: "/gb/london/yoga" },
    ]);
    expect((schema.itemListElement as unknown[])).toHaveLength(2);
    expect(paginationLinks({ pathname: "/directory", page: 2, totalPages: 3 })).toEqual({
      canonical: "/directory?page=2",
      prev: "/directory",
      next: "/directory?page=3",
    });
    expect(localeAlternates("/directory", ["en", "fr"]).languages["x-default"]).toBe("/directory");
  });

  it("collapses redirect chains and enforces CWV budgets", () => {
    expect(
      resolveRedirect("/old", [
        { from: "/old", to: "/middle", removed: false },
        { from: "/middle", to: "/new", removed: false },
      ]),
    ).toEqual({ status: 301, location: "/new" });
    expect(webVitalsRegressions({ lcp: 2_600, inp: 150, cls: 0.05 })).toEqual(["lcp"]);
  });
});

describe("provider dashboard domain", () => {
  const onboarding = {
    providerId: "p",
    domicileCountry: "GB",
    completed: ["profile", "identity"] as const,
    identityVerified: true,
    commercialMode: null,
    updatedAt: new Date(),
  };

  it("provides a complete advertising-only onboarding path", () => {
    const chosen = chooseCommercialMode(
      { ...onboarding, completed: [...onboarding.completed] },
      "advertising_only",
    );
    expect(nextOnboardingStep(chosen)).toBe("schedule");
    expect(() =>
      chooseCommercialMode({ ...onboarding, completed: [...onboarding.completed] }, "stripe"),
    ).toThrow(/US/);
  });

  it("hides transactional CRM/tools and validates team/policy input", () => {
    expect(studentCrm("p", false, [])).toEqual([]);
    expect(visibleMarketingTools(false)).not.toContain("promo_codes");
    expect(createTeamInvite("Person@Example.com", "staff", new Date()).email).toBe(
      "person@example.com",
    );
    expect(
      validateProviderPolicies({
        cancellationHours: -1,
        waiverText: "",
        houseRules: [],
        bookingWindowDays: 0,
      }),
    ).toHaveLength(3);
  });
});
