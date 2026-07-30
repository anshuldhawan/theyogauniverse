import { describe, expect, it } from "vitest";
import { isOptedOut } from "./ingestion";
import { openReports } from "./moderation";
import { allProviders, providerBySlug, slotsForProvider } from "./repo";
import {
  honorRemoval,
  removalSlaState,
  requestRemoval,
  resolveListing,
} from "./removal";

describe("resolveListing", () => {
  it("accepts a bare slug, a profile URL, and an exact name", () => {
    expect(resolveListing("maya")?.slug).toBe("maya");
    expect(resolveListing("https://www.theyogauniverse.com/maya")?.slug).toBe("maya");
    const maya = providerBySlug("maya");
    expect(resolveListing(maya!.name)?.slug).toBe("maya");
  });

  it("returns undefined for unknown listings", () => {
    expect(resolveListing("not-a-real-provider")).toBeUndefined();
  });
});

describe("removal requests (ING-7 / Decision #7)", () => {
  it("honours immediately when the requester email matches the listing contact", () => {
    const maya = providerBySlug("maya")!;
    const outcome = requestRemoval({
      listing: "maya",
      name: "Maya",
      email: "hello@maya.example.com",
    });

    expect(outcome.kind).toBe("removed");
    expect(providerBySlug("maya")).toBeUndefined();
    expect(allProviders().some((p) => p.slug === "maya")).toBe(false);
    expect(slotsForProvider("maya")).toEqual([]);
    expect(
      isOptedOut({
        name: maya.name,
        citySlug: maya.citySlug,
        country: maya.country,
        sourceUrl: "https://example.com",
        contactEmail: null,
        fetchedAt: new Date().toISOString(),
      }),
    ).toBe(true);
    expect(openReports().some((r) => r.id === outcome.reportId)).toBe(false);
  });

  it("queues unverified requests and honours them with one admin action", () => {
    const before = providerBySlug("daniel");
    expect(before).toBeDefined();

    const outcome = requestRemoval({
      listing: "daniel",
      name: "Daniel",
      email: "someone-else@example.com",
      detail: "Please take this down.",
    });

    expect(outcome.kind).toBe("queued");
    expect(providerBySlug("daniel")).toBeDefined();

    const report = openReports().find((r) => r.id === outcome.reportId);
    expect(report?.reason).toBe("removal_request");
    expect(removalSlaState(report!)).toBe("within");

    const resolved = honorRemoval(outcome.reportId, "ops@theyogauniverse");
    expect(resolved?.status).toBe("actioned");
    expect(providerBySlug("daniel")).toBeUndefined();
    expect(openReports().some((r) => r.id === outcome.reportId)).toBe(false);
  });

  it("flags requests older than 72 hours as overdue", () => {
    const outcome = requestRemoval({
      listing: "sofia",
      name: "Sofia",
      email: "someone@example.com",
    });
    const report = openReports().find((r) => r.id === outcome.reportId)!;
    const future = new Date(report.createdAt.getTime() + 73 * 3_600_000);
    expect(removalSlaState(report, future)).toBe("overdue");
    honorRemoval(outcome.reportId, "ops@theyogauniverse");
  });

  it("queues requests for unknown listings so ops can investigate", () => {
    const outcome = requestRemoval({
      listing: "https://www.theyogauniverse.com/ghost-provider",
      name: "Ghost",
      email: "ghost@example.com",
    });
    expect(outcome.kind).toBe("queued");
    expect(outcome.providerName).toBeNull();
    const report = openReports().find((r) => r.id === outcome.reportId);
    expect(report?.targetId).toBe("ghost-provider");
    honorRemoval(outcome.reportId, "ops@theyogauniverse");
  });
});
