import { describe, expect, it } from "vitest";
import { expandOccurrences, localTimeOf, wallClockToUtc } from "./scheduling";

describe("scheduling engine (SCH) — DST suite", () => {
  it("keeps a weekly 18:00 New York class at 18:00 local across the spring-forward transition", () => {
    // US DST began Sunday 8 March 2026. Tuesdays 3 Mar and 10 Mar straddle it.
    const occurrences = expandOccurrences(
      {
        rrule: "FREQ=WEEKLY;BYDAY=TU",
        start: { year: 2026, month: 3, day: 3, hour: 18, minute: 0 },
        timezone: "America/New_York",
        durationMinutes: 75,
      },
      new Date("2026-03-01T00:00:00Z"),
      new Date("2026-03-15T00:00:00Z"),
    );
    expect(occurrences).toHaveLength(2);
    // Wall clock identical…
    expect(occurrences[0].local).toEqual({ date: "2026-03-03", time: "18:00" });
    expect(occurrences[1].local).toEqual({ date: "2026-03-10", time: "18:00" });
    // …UTC instant shifts by one hour (EST -05:00 → EDT -04:00).
    expect(occurrences[0].startsAtUtc.toISOString()).toBe("2026-03-03T23:00:00.000Z");
    expect(occurrences[1].startsAtUtc.toISOString()).toBe("2026-03-10T22:00:00.000Z");
  });

  it("handles the fall-back transition (November, New York)", () => {
    // US DST ended Sunday 1 November 2026.
    const occurrences = expandOccurrences(
      {
        rrule: "FREQ=WEEKLY;BYDAY=SA",
        start: { year: 2026, month: 10, day: 31, hour: 9, minute: 0 },
        timezone: "America/New_York",
        durationMinutes: 60,
      },
      new Date("2026-10-30T00:00:00Z"),
      new Date("2026-11-08T00:00:00Z"),
    );
    expect(occurrences).toHaveLength(2);
    expect(occurrences[0].startsAtUtc.toISOString()).toBe("2026-10-31T13:00:00.000Z"); // EDT
    expect(occurrences[1].startsAtUtc.toISOString()).toBe("2026-11-07T14:00:00.000Z"); // EST
  });

  it("southern-hemisphere DST (Sydney) shifts the opposite way", () => {
    // AEDT (UTC+11) ended 5 April 2026; AEST is UTC+10.
    const before = wallClockToUtc("Australia/Sydney", 2026, 4, 3, 6, 0);
    const after = wallClockToUtc("Australia/Sydney", 2026, 4, 10, 6, 0);
    expect(before.toISOString()).toBe("2026-04-02T19:00:00.000Z");
    expect(after.toISOString()).toBe("2026-04-09T20:00:00.000Z");
  });

  it("zones without DST are unaffected (Phoenix)", () => {
    const march = wallClockToUtc("America/Phoenix", 2026, 3, 3, 18, 0);
    const july = wallClockToUtc("America/Phoenix", 2026, 7, 7, 18, 0);
    expect(march.toISOString()).toBe("2026-03-04T01:00:00.000Z");
    expect(july.toISOString()).toBe("2026-07-08T01:00:00.000Z");
  });

  it("honours exception dates (SCH-2 cancellations)", () => {
    const occurrences = expandOccurrences(
      {
        rrule: "FREQ=WEEKLY;BYDAY=MO",
        start: { year: 2026, month: 7, day: 6, hour: 7, minute: 30 },
        timezone: "Europe/London",
        durationMinutes: 60,
        exdates: ["2026-07-13"],
      },
      new Date("2026-07-01T00:00:00Z"),
      new Date("2026-07-28T00:00:00Z"),
    );
    expect(occurrences.map((o) => o.local.date)).toEqual([
      "2026-07-06",
      "2026-07-20",
      "2026-07-27",
    ]);
  });

  it("round-trips local display time (DM-5: store UTC, render local)", () => {
    const utc = wallClockToUtc("America/Denver", 2026, 12, 24, 8, 15);
    expect(localTimeOf("America/Denver", utc)).toEqual({ date: "2026-12-24", time: "08:15" });
  });
});
