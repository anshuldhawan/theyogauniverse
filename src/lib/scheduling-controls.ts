import type { Money } from "./money";
import type { OccurrenceInstant, RecurrenceSpec } from "./scheduling";
import { expandOccurrences } from "./scheduling";

export interface ScheduledResource {
  occurrenceId: string;
  organisationId: string;
  roomId: string | null;
  resourceIds: string[];
  startsAtUtc: Date;
  endsAtUtc: Date;
  status: "scheduled" | "cancelled";
}

export interface ScheduleConflict {
  occurrenceIds: [string, string];
  resource: string;
}

export function detectScheduleConflicts(rows: ScheduledResource[]): ScheduleConflict[] {
  const active = rows.filter((row) => row.status === "scheduled");
  const conflicts: ScheduleConflict[] = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const left = active[i];
      const right = active[j];
      if (
        left.organisationId !== right.organisationId ||
        left.startsAtUtc >= right.endsAtUtc ||
        right.startsAtUtc >= left.endsAtUtc
      ) continue;
      const shared = [
        ...(left.roomId && left.roomId === right.roomId ? [`room:${left.roomId}`] : []),
        ...left.resourceIds.filter((id) => right.resourceIds.includes(id)).map((id) => `resource:${id}`),
      ];
      for (const resource of shared) {
        conflicts.push({ occurrenceIds: [left.occurrenceId, right.occurrenceId], resource });
      }
    }
  }
  return conflicts;
}

export interface BookingWindow {
  opensDaysBefore: number;
  closesMinutesBefore: number;
  lateBookingCutoffMinutes?: number;
  earlyBirdEndsDaysBefore?: number;
}

export function bookingWindowState(
  policy: BookingWindow,
  startsAtUtc: Date,
  now: Date,
): "not_open" | "early_bird" | "open" | "late_cutoff" | "closed" {
  const minutesBefore = (startsAtUtc.getTime() - now.getTime()) / 60_000;
  if (minutesBefore > policy.opensDaysBefore * 1_440) return "not_open";
  if (minutesBefore < policy.closesMinutesBefore) return "closed";
  if (
    policy.lateBookingCutoffMinutes !== undefined &&
    minutesBefore < policy.lateBookingCutoffMinutes
  ) return "late_cutoff";
  if (
    policy.earlyBirdEndsDaysBefore !== undefined &&
    minutesBefore >= policy.earlyBirdEndsDaysBefore * 1_440
  ) return "early_bird";
  return "open";
}

export interface OccurrenceDefaults {
  teacherId: string;
  roomId: string;
  capacity: number;
  price: Money;
  status: "scheduled" | "cancelled";
}

export type OccurrenceOverride = Partial<OccurrenceDefaults> & {
  substituteTeacherId?: string;
};

export function applyOccurrenceOverride(
  defaults: OccurrenceDefaults,
  override: OccurrenceOverride,
): OccurrenceDefaults & { reviewTeacherId: string; substituted: boolean } {
  const teacherId = override.substituteTeacherId ?? override.teacherId ?? defaults.teacherId;
  return {
    ...defaults,
    ...override,
    teacherId,
    reviewTeacherId: teacherId,
    substituted: Boolean(override.substituteTeacherId),
  };
}

export interface SeasonalRule {
  effectiveFrom: string;
  effectiveUntil: string;
  spec: RecurrenceSpec;
}

/** Expands only the rule effective for each local season; holidays are EXDATEs. */
export function expandSeasonalSchedule(
  seasons: SeasonalRule[],
  holidays: string[],
  windowStartUtc: Date,
  windowEndUtc: Date,
  cap = 500,
): OccurrenceInstant[] {
  const occurrences = seasons.flatMap((season) =>
    expandOccurrences(
      { ...season.spec, exdates: [...(season.spec.exdates ?? []), ...holidays] },
      windowStartUtc,
      windowEndUtc,
      cap,
    ).filter(
      (occurrence) =>
        occurrence.local.date >= season.effectiveFrom &&
        occurrence.local.date <= season.effectiveUntil,
    ),
  );
  return occurrences
    .sort((a, b) => a.startsAtUtc.getTime() - b.startsAtUtc.getTime())
    .slice(0, cap);
}

export interface RoomSpot {
  id: string;
  enabled: boolean;
}

export function selectSpot(
  spots: RoomSpot[],
  reservedSpotIds: ReadonlySet<string>,
  requestedSpotId?: string,
): string | null {
  const available = spots.filter((spot) => spot.enabled && !reservedSpotIds.has(spot.id));
  if (requestedSpotId) return available.some((spot) => spot.id === requestedSpotId) ? requestedSpotId : null;
  return available[0]?.id ?? null;
}

export function bulkPublishOccurrences(
  spec: RecurrenceSpec,
  termStartUtc: Date,
  termEndUtc: Date,
  existingStarts: ReadonlySet<string>,
  cap = 500,
): OccurrenceInstant[] {
  return expandOccurrences(spec, termStartUtc, termEndUtc, cap).filter(
    (occurrence) => !existingStarts.has(occurrence.startsAtUtc.toISOString()),
  );
}
