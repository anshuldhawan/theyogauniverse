import { describe, expect, it } from "vitest";
import { parseCsvSchedule, parseIcsEvents, reconcileSchedule } from "./schedule-import";

const FEED = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "BEGIN:VEVENT",
  "UID:1@studio",
  "DTSTART:20260803T170000Z",
  "DTEND:20260803T181500Z",
  "RRULE:FREQ=WEEKLY;BYDAY=MO",
  "SUMMARY:Vinyasa Flow\\, All Levels",
  "LOCATION:Main studio\\; 2nd floor",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:2@studio",
  "DTSTART;TZID=America/New_York:20260805T090000",
  "SUMMARY:Restorative with a very long descrip",
  " tion folded across lines",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:3@studio",
  "SUMMARY:No start date — skipped",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("ICS schedule import (INT-1)", () => {
  it("parses events with unescaping, folding, and RRULE passthrough", () => {
    const events = parseIcsEvents(FEED);
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      externalId: "1@studio",
      summary: "Vinyasa Flow, All Levels",
      location: "Main studio; 2nd floor",
      rrule: "FREQ=WEEKLY;BYDAY=MO",
    });
    expect(events[0].startsAtUtc.toISOString()).toBe("2026-08-03T17:00:00.000Z");
    expect(events[1].summary).toBe("Restorative with a very long description folded across lines");
    expect(events[1].endsAtUtc).toBeNull();
  });

  it("imports quoted CSV rows and skips invalid dates", () => {
    const events = parseCsvSchedule(
      'id,summary,starts_at,ends_at,location\n1,"Flow, all levels",2026-08-03T17:00:00Z,2026-08-03T18:00:00Z,"Room 1"\n2,Bad,not-a-date,,Room 2',
    );
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ externalId: "1", summary: "Flow, all levels", location: "Room 1" });
  });

  it("replaces only one sync source and lets native inventory win conflicts", () => {
    const imported = parseCsvSchedule(
      "id,summary,starts_at\nnew,Imported conflict,2026-08-03T17:00:00Z\nnew-2,Imported later,2026-08-04T17:00:00Z",
    );
    const [native] = parseCsvSchedule("id,summary,starts_at\nnative,Native class,2026-08-03T17:00:00Z");
    const result = reconcileSchedule(
      [
        { ...native, origin: "native", source: "native" },
        { ...imported[0], externalId: "old", origin: "synced", source: "mindbody" },
      ],
      "mindbody",
      imported,
    );
    expect(result.map((event) => event.summary)).toEqual(["Native class", "Imported later"]);
  });
});
