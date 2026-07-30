import { describe, expect, it } from "vitest";
import {
  applyScheduledPublishing,
  bulkCancelOccurrenceIds,
  bulkPriceChange,
  cloneListing,
  exportListingsCsv,
  inventoryListingSchema,
  parseListingsCsv,
  publishListing,
  validateForPublish,
  type InventoryListing,
} from "./inventory";
import { TAXONOMY_VERSION } from "./taxonomy";

const base = {
  id: "listing-1",
  providerId: "provider-1",
  organisationId: "org-1",
  title: 'Flow, "Focus"',
  description: "A class",
  status: "draft" as const,
  visibility: "public" as const,
  scheduledPublishAt: null,
  supplyType: "in_person" as const,
  performanceCountry: "US",
  price: { amount: 2500, currency: "USD" },
  indicativeRange: null,
  taxonomyVersion: TAXONOMY_VERSION,
  styles: ["vinyasa"],
  policies: { cancellation: "24h" },
};

const recurring: InventoryListing = inventoryListingSchema.parse({
  ...base,
  type: "recurring_class",
  details: {
    rrule: "FREQ=WEEKLY;BYDAY=MO",
    exdates: [],
    timezone: "America/New_York",
    durationMinutes: 60,
    defaultCapacity: 20,
    teacherProviderId: "teacher-1",
    roomId: "room-1",
    delivery: "in_person",
  },
});

describe("listing inventory schemas (LST-1–8)", () => {
  it.each([
    [
      "workshop",
      {
        startsAt: "2026-09-01T10:00:00Z",
        endsAt: "2026-09-01T12:00:00Z",
        category: "sound_bath",
        seriesDates: [],
      },
    ],
    [
      "course",
      {
        startsAt: "2026-09-01T10:00:00Z",
        endsAt: "2026-10-01T10:00:00Z",
        sessionCount: 6,
        cohortCapacity: 18,
        attendanceTracking: true,
        makeupPolicy: "One make-up",
      },
    ],
    [
      "retreat",
      {
        venueId: null,
        locationText: "Joshua Tree",
        departures: [{ startsAt: "2026-09-01", endsAt: "2026-09-05" }],
        roomTypes: [
          {
            id: "shared",
            name: "Shared",
            occupancy: 2,
            inventory: 5,
            price: { amount: 120000, currency: "USD" },
            singleSupplement: null,
          },
        ],
        inclusions: ["Meals"],
        exclusions: ["Flights"],
        itinerary: ["Arrival"],
        whatToBring: ["Mat"],
        arrivalInfo: "Transfer at 3pm",
        depositBps: 2500,
        balanceDueDaysBefore: 30,
        minimumParticipants: 6,
        maximumParticipants: 12,
        travelInsurancePrompt: true,
      },
    ],
    [
      "teacher_training",
      {
        hours: 200,
        registryAccreditation: null,
        modules: ["Anatomy"],
        contactHours: 180,
        leadTeacherId: "teacher-1",
        prerequisites: [],
        applicationRequired: true,
        cohortCapacity: 20,
        instalmentCounts: [3, 6],
        accommodationAddOns: [],
        delivery: "hybrid",
      },
    ],
    [
      "private_session",
      {
        durationOptions: [
          { minutes: 60, price: { amount: 9000, currency: "USD" } },
        ],
        locations: ["online"],
        travelRadiusKm: null,
        travelSurcharge: null,
        availabilityRule: "FREQ=WEEKLY;BYDAY=TU",
      },
    ],
    [
      "on_demand",
      {
        mediaType: "video",
        privateMediaRef: "private://asset",
        chapters: [{ title: "Welcome", startsAtSeconds: 0 }],
        durationSeconds: 1800,
        level: "beginner",
        bundleIds: [],
        signedUrlTtlSeconds: 900,
      },
    ],
    [
      "venue",
      {
        capacity: 80,
        rooms: [{ name: "Main", capacity: 50 }],
        accommodation: true,
        catering: true,
        availableDates: ["2026-09-01"],
        dayRateRange: {
          low: { amount: 100000, currency: "USD" },
          high: { amount: 180000, currency: "USD" },
        },
      },
    ],
  ])("validates %s-specific inventory", (type, details) => {
    const input = {
      ...base,
      type,
      details,
      ...(type === "on_demand"
        ? {
            supplyType: "on_demand",
            performanceCountry: null,
          }
        : {}),
      ...(type === "venue" ? { price: null } : {}),
    };
    expect(inventoryListingSchema.parse(input).type).toBe(type);
  });
});

describe("inventory lifecycle and bulk operations (LST-9–11)", () => {
  it("enforces publish invariants and scheduled publishing", () => {
    expect(validateForPublish({ ...recurring, performanceCountry: null })).toContain(
      "In-person listings require a performance country",
    );
    const scheduled = {
      ...recurring,
      scheduledPublishAt: new Date("2026-09-01T00:00:00Z"),
    };
    expect(publishListing(scheduled, new Date("2026-08-01")).status).toBe("draft");
    expect(
      applyScheduledPublishing([scheduled], new Date("2026-09-01"))[0].status,
    ).toBe("published");
  });

  it("clones pricing and policies into a new draft", () => {
    const clone = cloneListing({ ...recurring, status: "published" }, { id: "copy-1" });
    expect(clone).toMatchObject({
      id: "copy-1",
      title: 'Flow, "Focus" (copy)',
      status: "draft",
      price: { amount: 2500, currency: "USD" },
      policies: { cancellation: "24h" },
    });
  });

  it("applies integer price changes and deduplicates bulk cancellations", () => {
    expect(bulkPriceChange([recurring], -500)[0].price?.amount).toBe(2000);
    expect(bulkCancelOccurrenceIds(["o1", "o1", "o2"])).toEqual([
      {
        occurrenceId: "o1",
        status: "cancelled",
        refundRequired: true,
        notificationRequired: true,
      },
      {
        occurrenceId: "o2",
        status: "cancelled",
        refundRequired: true,
        notificationRequired: true,
      },
    ]);
  });

  it("round-trips listing CSV fields including commas and quotes", () => {
    const csv = exportListingsCsv([recurring]);
    const rows = parseListingsCsv(csv);
    expect(rows[0]).toMatchObject({
      id: "listing-1",
      title: 'Flow, "Focus"',
      type: "recurring_class",
      performanceCountry: "US",
      price: { amount: 2500, currency: "USD" },
    });
  });
});
