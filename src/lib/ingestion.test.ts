import { describe, expect, it } from "vitest";
import {
  article14Obligation,
  isOptedOut,
  isStale,
  normaliseName,
  recordOptOut,
  resolveEntity,
  type CandidateRecord,
} from "./ingestion";
import { escalationLevel, fileReport, openReports, resolveReport } from "./moderation";

const candidate = (over: Partial<CandidateRecord>): CandidateRecord => ({
  name: "Brooklyn Yoga Shala",
  citySlug: "new-york",
  country: "US",
  sourceUrl: "https://example.com",
  contactEmail: "hello@example.com",
  fetchedAt: "2026-07-01T00:00:00Z",
  ...over,
});

describe("entity resolution (ING-2)", () => {
  const existing = [
    { id: "p1", name: "Brooklyn Yoga Shala", citySlug: "new-york" },
    { id: "p2", name: "Móksha Yoga Studio", citySlug: "chicago" },
  ];

  it("normalises names aggressively", () => {
    expect(normaliseName("The Móksha Yoga Studio!")).toBe("moksha");
    expect(normaliseName("Brooklyn  Yoga   Shala")).toBe("brooklyn");
  });

  it("matches same normalised name in the same city", () => {
    expect(resolveEntity(candidate({}), existing)).toEqual({ kind: "match", providerId: "p1" });
  });

  it("routes same-name-different-city to human review", () => {
    const outcome = resolveEntity(candidate({ name: "Moksha Yoga", citySlug: "austin" }), existing);
    expect(outcome.kind).toBe("review");
  });

  it("treats unknown names as new", () => {
    expect(resolveEntity(candidate({ name: "Dharma House" }), existing)).toEqual({ kind: "new" });
  });
});

describe("Art. 14 obligation (ING-5)", () => {
  it("is due one month after ingestion via email when contactable", () => {
    const obligation = article14Obligation(candidate({}));
    expect(obligation.dueBy).toBe("2026-08-01T00:00:00.000Z");
    expect(obligation.channel).toBe("email");
  });

  it("flags undiscoverable contact", () => {
    expect(article14Obligation(candidate({ contactEmail: null })).channel).toBe(
      "none_discoverable",
    );
  });
});

describe("opt-out tombstones (ING-7)", () => {
  it("suppresses re-crawled records after opt-out", () => {
    const record = candidate({ name: "Quiet Mountain Meditation", citySlug: "denver" });
    expect(isOptedOut(record)).toBe(false);
    recordOptOut({ name: "Quiet Mountain Meditation", citySlug: "denver" });
    expect(isOptedOut(record)).toBe(true);
  });
});

describe("freshness (ING-9)", () => {
  const now = new Date("2026-07-28T00:00:00Z");
  it("marks seeded data stale after the window; claimed data never", () => {
    expect(isStale({ lastVerifiedAt: "2025-06-01T00:00:00Z", provenance: "seeded" }, now)).toBe(true);
    expect(isStale({ lastVerifiedAt: "2026-06-01T00:00:00Z", provenance: "seeded" }, now)).toBe(false);
    expect(isStale({ lastVerifiedAt: "2024-01-01T00:00:00Z", provenance: "claimed" }, now)).toBe(false);
  });
});

describe("moderation queue (TSF)", () => {
  it("files, escalates and resolves reports with an audit trail", () => {
    const first = fileReport({
      targetType: "provider",
      targetId: "prov-9",
      reason: "misleading_credentials",
      detail: "Claims RYT-500, registry says otherwise",
    });
    fileReport({ targetType: "provider", targetId: "prov-9", reason: "impersonation", detail: "x" });
    expect(escalationLevel("prov-9")).toBe("elevated");

    const resolved = resolveReport(first.id, "actioned", "admin@theyogauniverse", "Tier downgraded");
    expect(resolved?.resolution?.outcome).toBe("Tier downgraded");
    expect(openReports().some((r) => r.id === first.id)).toBe(false);
    expect(resolveReport(first.id, "dismissed", "admin@theyogauniverse", "dupe")).toBeNull();
  });
});
