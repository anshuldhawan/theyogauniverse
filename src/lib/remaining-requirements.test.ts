import { describe, expect, it, vi } from "vitest";
import { accessibilityControlState, assessConsumerOffer } from "./compliance-controls";
import {
  clusterMapResults,
  comparison,
  multilingualSearch,
  pointInPolygon,
  runSearchLoadHarness,
  savedSearchAlert,
} from "./discovery-advanced";
import {
  dueReviewPrompts,
  ingestionExecutor,
  messageCopy,
} from "./operations-controls";
import { collectSeoObservations, seoKpis } from "./seo-monitoring";

describe("compliance controls", () => {
  it("calculates the all-in price and blocks hidden mandatory fees", () => {
    const result = assessConsumerOffer({
      region: "UK",
      baseAmount: 10_000,
      components: [{ code: "service", amount: 500, mandatory: true, disclosedBeforeCheckout: false }],
      recurring: true,
      renewalConsentAt: null,
      cancellationDisclosure: true,
    });
    expect(result.allInAmount).toBe(10_500);
    expect(result.violations).toEqual(["undisclosed_mandatory_fee:service", "missing_recurring_consent"]);
  });

  it("never converts accessibility governance into a legal compliance claim", () => {
    expect(accessibilityControlState().status).toBe("external_required");
    expect(
      accessibilityControlState({
        reviewedAt: new Date(),
        reviewer: "specialist",
        scope: ["checkout"],
        findingsOpen: 0,
        evidenceRefs: ["report-1"],
      }).claim,
    ).toBe("no_legal_compliance_claim");
  });
});

describe("operations controls", () => {
  it("reserves model use for unstructured extraction, normalization and disambiguation", () => {
    expect(ingestionExecutor({ kind: "fetch", deterministicAvailable: false })).toBe("crawler");
    expect(ingestionExecutor({ kind: "normalise", deterministicAvailable: true })).toBe("deterministic_parser");
    expect(ingestionExecutor({ kind: "disambiguate", deterministicAvailable: false, confidence: 0.8 })).toBe("model");
  });

  it("has localized notification copy for all launch locales", () => {
    for (const locale of ["en", "es", "pt", "de", "fr", "it", "nl"]) {
      expect(messageCopy(locale).bookingConfirmed.length).toBeGreaterThan(5);
    }
  });

  it("sends one review request and at most one reminder", () => {
    const ended = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-01-06T00:00:00Z");
    expect(dueReviewPrompts([{ bookingId: "b", email: "a@b.test", pushSubscription: true, occurrenceEndedAt: ended }], now)[0].channels)
      .toEqual(["email", "web_push"]);
    expect(dueReviewPrompts([{
      bookingId: "b", email: "a@b.test", pushSubscription: false, occurrenceEndedAt: ended,
      requestedAt: new Date("2026-01-02T00:00:00Z"), remindedAt: new Date("2026-01-05T00:00:00Z"),
    }], now)).toEqual([]);
  });
});

describe("SEO monitoring", () => {
  it("is gracefully disabled and normalizes enabled provider output", async () => {
    const disabled = await collectSeoObservations([{
      provider: "google_search_console", enabled: false, collect: vi.fn(),
    }], new Date(0), new Date());
    expect(disabled.status).toBe("disabled");
    const collected = await collectSeoObservations([{
      provider: "ai_citation",
      enabled: true,
      collect: async () => [{
        query: " yoga ", url: "https://example.com/yoga", observedAt: "2026-01-01",
        cited: true, competitorCitations: 3,
      }],
    }], new Date(0), new Date());
    expect(collected.observations[0].query).toBe("yoga");
    expect(seoKpis(collected.observations).citationShareOfVoice).toBe(0.25);
  });
});

describe("advanced discovery", () => {
  it("clusters and filters drawn map results", () => {
    const rows = [
      { id: "a", lat: 1, lng: 1 },
      { id: "b", lat: 1.001, lng: 1.001 },
    ];
    expect(clusterMapResults(rows, 8)[0].count).toBe(2);
    expect(pointInPolygon(rows[0], [[0, 0], [2, 0], [2, 2], [0, 2]])).toBe(true);
  });

  it("deduplicates alerts and supports mixed-mode comparisons", () => {
    const alert = savedSearchAlert({
      id: "s", userId: "u", queryFingerprint: "q", channels: ["email"], lastAlertedResultIds: ["a"],
    }, ["a", "b"]);
    expect(alert.newResultIds).toEqual(["b"]);
    expect(comparison([
      { id: "a", mode: "bookable", priceLabel: "$100", durationLabel: "2 nights", inclusions: [], accreditation: null, rating: 4.5 },
      { id: "b", mode: "advertising_only", priceLabel: "€80–100 indicative", durationLabel: "2 nights", inclusions: [], accreditation: "YA", rating: null },
    ])).toHaveLength(2);
  });

  it("matches across languages and labels translated display", () => {
    const result = multilingualSearch("yoga doux", ["gentle yoga"], [{
      id: "d", originalLanguage: "en", originalText: "Gentle yoga class", translations: { fr: "Cours de yoga doux" },
    }], "fr");
    expect(result[0]).toMatchObject({ displayText: "Cours de yoga doux", machineTranslated: true });
  });

  it("measures the p95 budget without asserting production scale", async () => {
    const result = await runSearchLoadHarness({ iterations: 20, concurrency: 4, execute: async () => {} });
    expect(result.samples).toHaveLength(20);
    expect(result.budgetMs).toBe(400);
    expect(result.passed).toBe(true);
  });
});
