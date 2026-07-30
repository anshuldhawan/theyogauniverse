import { describe, expect, it } from "vitest";
import { money } from "./money";
import {
  applyOccurrenceOverride,
  bookingWindowState,
  bulkPublishOccurrences,
  detectScheduleConflicts,
  expandSeasonalSchedule,
  selectSpot,
} from "./scheduling-controls";

describe("scheduling controls", () => {
  it("detects overlapping rooms/resources within one studio (SCH-4)", () => {
    const base = {
      organisationId: "studio",
      startsAtUtc: new Date("2026-09-01T10:00:00Z"),
      endsAtUtc: new Date("2026-09-01T11:00:00Z"),
      status: "scheduled" as const,
    };
    expect(detectScheduleConflicts([
      { ...base, occurrenceId: "a", roomId: "one", resourceIds: ["blocks"] },
      { ...base, occurrenceId: "b", roomId: "one", resourceIds: ["blocks"] },
    ]).map((row) => row.resource)).toEqual(["room:one", "resource:blocks"]);
  });

  it("resolves booking and early-bird windows (SCH-7)", () => {
    const start = new Date("2026-09-10T12:00:00Z");
    const policy = { opensDaysBefore: 30, closesMinutesBefore: 15, lateBookingCutoffMinutes: 60, earlyBirdEndsDaysBefore: 7 };
    expect(bookingWindowState(policy, start, new Date("2026-08-01T12:00:00Z"))).toBe("not_open");
    expect(bookingWindowState(policy, start, new Date("2026-08-20T12:00:00Z"))).toBe("early_bird");
    expect(bookingWindowState(policy, start, new Date("2026-09-10T11:30:00Z"))).toBe("late_cutoff");
    expect(bookingWindowState(policy, start, new Date("2026-09-10T11:50:00Z"))).toBe("closed");
  });

  it("applies substitute attribution without mutating defaults (SCH-2/3)", () => {
    const defaults = { teacherId: "teacher", roomId: "a", capacity: 10, price: money(2000, "USD"), status: "scheduled" as const };
    const result = applyOccurrenceOverride(defaults, { substituteTeacherId: "sub", capacity: 8 });
    expect(result).toMatchObject({ teacherId: "sub", reviewTeacherId: "sub", capacity: 8, substituted: true });
    expect(defaults.teacherId).toBe("teacher");
  });

  it("supports seasonal swaps, holiday exclusions and idempotent term publishing (SCH-1/8)", () => {
    const seasons = [{
      effectiveFrom: "2026-09-01",
      effectiveUntil: "2026-09-30",
      spec: {
        rrule: "FREQ=WEEKLY;BYDAY=TU",
        start: { year: 2026, month: 9, day: 1, hour: 18, minute: 0 },
        timezone: "America/New_York",
        durationMinutes: 60,
      },
    }];
    const expanded = expandSeasonalSchedule(seasons, ["2026-09-08"], new Date("2026-09-01"), new Date("2026-10-01"));
    expect(expanded.map((row) => row.local.date)).toEqual(["2026-09-01", "2026-09-15", "2026-09-22", "2026-09-29"]);
    const published = bulkPublishOccurrences(
      seasons[0].spec,
      new Date("2026-09-01"),
      new Date("2026-10-01"),
      new Set([expanded[0].startsAtUtc.toISOString()]),
    );
    expect(published).toHaveLength(4);
  });

  it("selects only enabled, unreserved room-map spots (SCH-6)", () => {
    const spots = [{ id: "A1", enabled: true }, { id: "A2", enabled: false }, { id: "A3", enabled: true }];
    expect(selectSpot(spots, new Set(["A1"]), "A3")).toBe("A3");
    expect(selectSpot(spots, new Set(["A1"]), "A2")).toBeNull();
  });
});
