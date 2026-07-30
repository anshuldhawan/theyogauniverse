import { describe, expect, it } from "vitest";
import {
  autosuggest,
  parseNaturalQuery,
  searchDiscovery,
  staleDisposition,
  type DiscoveryDocument,
} from "./discovery";

const now = new Date("2026-07-29T12:00:00");
const base: DiscoveryDocument = {
  id: "1", type: "retreat", name: "Élan Yoga", city: "Montréal", neighbourhood: "Mile End",
  destination: "Québec", styles: ["vinyasa"], startsAtUtc: new Date("2026-08-01T18:00:00"),
  lastVerifiedAt: new Date("2026-07-01"), livenessFailures: 0,
  retreat: {
    nights: 5, totalPrice: 120000, accommodation: "private", foods: ["vegan"],
    accreditation: "Yoga Alliance", hours: 200, soloTraveller: true, alcoholFree: true,
    silent: false, familyFriendly: false, depositAmount: 20000, instalments: true,
  },
};

describe("unified discovery controls", () => {
  it("searches all document types with typo and accent tolerance (SRCH-1/2/8)", () => {
    expect(searchDiscovery([base], { mode: "provider", text: "montreal", types: ["retreat"] }, now)).toHaveLength(1);
    expect(searchDiscovery([base], { mode: "location", text: "vinyassa" }, now)).toHaveLength(1);
    expect(autosuggest("elan", [base])).toContain("Élan Yoga");
  });

  it("maps natural language and preserves keyword fallback (SRCH-6)", () => {
    expect(parseNaturalQuery("online yin tomorrow morning")).toEqual({
      structured: { timePreset: "tomorrow_morning", types: ["online"] },
      fallbackKeywords: "yin",
      mappings: [
        { phrase: "tomorrow morning", filter: "timePreset=tomorrow_morning" },
        { phrase: "online", filter: "types=online" },
      ],
    });
  });

  it("applies time-first and retreat-specific filters (SRCH-3/5)", () => {
    expect(searchDiscovery([base], {
      mode: "time", startsAfter: new Date("2026-08-01T00:00:00Z"), startsBefore: new Date("2026-08-02T12:00:00Z"),
      retreat: { minNights: 4, maxTotalPrice: 130000, food: "vegan", hours: 200, instalments: true },
    }, now)).toHaveLength(1);
    expect(searchDiscovery([base], { mode: "time", retreat: { familyFriendly: true } }, now)).toHaveLength(0);
  });

  it("demotes then unpublishes stale documents (SRCH-15)", () => {
    expect(staleDisposition(base, now)).toBe("live");
    expect(staleDisposition({ ...base, livenessFailures: 1 }, now)).toBe("demote");
    expect(staleDisposition({ ...base, livenessFailures: 3 }, now)).toBe("unpublish");
  });
});
