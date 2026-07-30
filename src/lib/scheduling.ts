/**
 * SCH — the scheduling engine. Recurring rules are RRULE-based (SCH-1),
 * expanded into concrete occurrences in the listing's IANA timezone (DM-5),
 * with exception dates and per-occurrence overrides living on the occurrence
 * (DM-2/SCH-2).
 *
 * DST rule (SCH-6): a class at 18:00 local time stays at 18:00 local time
 * across DST transitions — the UTC instant shifts, the wall clock does not.
 * The `rrule` library operates in naive/UTC time, so we expand wall-clock
 * times and convert each occurrence to UTC via the timezone's offset at that
 * specific date (not a fixed offset).
 */

import { RRule } from "rrule";

export interface RecurrenceSpec {
  /** RRULE string without DTSTART, e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR". */
  rrule: string;
  /** Series start, wall-clock local date-time components. */
  start: {
    year: number;
    month: number; // 1-12
    day: number;
    hour: number;
    minute: number;
  };
  timezone: string; // IANA identifier
  durationMinutes: number;
  /** Cancelled dates as YYYY-MM-DD local dates (EXDATE equivalent). */
  exdates?: string[];
}

export interface OccurrenceInstant {
  /** UTC instant of the start. */
  startsAtUtc: Date;
  endsAtUtc: Date;
  /** Wall-clock local time, for display and DST assertions. */
  local: { date: string; time: string };
  timezone: string;
}

/**
 * The UTC offset (ms) of `timezone` at the given UTC instant — derived from
 * Intl, so the IANA database (with all its DST history) is the authority.
 */
function offsetMs(timezone: string, utc: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(dtf.formatToParts(utc).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - utc.getTime();
}

/** Convert wall-clock components in `timezone` to the correct UTC instant. */
export function wallClockToUtc(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  // First guess: treat the wall clock as UTC, then correct by the zone
  // offset at that instant; iterate once more to stabilise across
  // transitions (handles the shifted-offset case near DST boundaries).
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  let guess = new Date(naive - offsetMs(timezone, new Date(naive)));
  guess = new Date(naive - offsetMs(timezone, guess));
  return guess;
}

export function localTimeOf(timezone: string, utc: Date): { date: string; time: string } {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(dtf.formatToParts(utc).map((p) => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

/**
 * Expand a recurrence into occurrences between two UTC instants.
 * Capped defensively; callers paginate by window (SCH-8 performance rule).
 */
export function expandOccurrences(
  spec: RecurrenceSpec,
  windowStartUtc: Date,
  windowEndUtc: Date,
  cap = 500,
): OccurrenceInstant[] {
  const rule = RRule.fromString(
    `DTSTART:${spec.start.year}${pad(spec.start.month)}${pad(spec.start.day)}T${pad(spec.start.hour)}${pad(spec.start.minute)}00Z\nRRULE:${spec.rrule}`,
  );

  // Expand in wall-clock space: rrule dates are naive local components
  // masquerading as UTC. Widen the window by a day each side to survive
  // offset differences, then convert precisely and filter.
  const wallStart = new Date(windowStartUtc.getTime() - 86_400_000);
  const wallEnd = new Date(windowEndUtc.getTime() + 86_400_000);
  const excluded = new Set(spec.exdates ?? []);

  const occurrences: OccurrenceInstant[] = [];
  for (const naive of rule.between(wallStart, wallEnd, true)) {
    const startsAtUtc = wallClockToUtc(
      spec.timezone,
      naive.getUTCFullYear(),
      naive.getUTCMonth() + 1,
      naive.getUTCDate(),
      naive.getUTCHours(),
      naive.getUTCMinutes(),
    );
    if (startsAtUtc < windowStartUtc || startsAtUtc >= windowEndUtc) continue;
    const local = localTimeOf(spec.timezone, startsAtUtc);
    if (excluded.has(local.date)) continue;
    occurrences.push({
      startsAtUtc,
      endsAtUtc: new Date(startsAtUtc.getTime() + spec.durationMinutes * 60_000),
      local,
      timezone: spec.timezone,
    });
    if (occurrences.length >= cap) break;
  }
  return occurrences;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
