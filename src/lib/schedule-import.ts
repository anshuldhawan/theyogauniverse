/**
 * INT-1 — schedule import. Providers publish an ICS feed (Google Calendar,
 * Momence, most booking tools export one); we parse VEVENTs into schedule
 * rows on a fetch cadence. Import replaces the imported segment only —
 * manually added rows are never touched.
 */

export interface ImportedEvent {
  externalId: string | null;
  summary: string;
  location: string;
  startsAtUtc: Date;
  endsAtUtc: Date | null;
  rrule: string | null;
}

function unfold(ics: string): string[] {
  // RFC 5545 line folding: continuation lines start with a space or tab.
  return ics
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n");
}

function parseIcsDate(value: string): Date | null {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h = "00", mi = "00", s = "00"] = match;
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)));
}

const unescapeText = (s: string) =>
  s.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");

export function parseIcsEvents(ics: string): ImportedEvent[] {
  const events: ImportedEvent[] = [];
  let current: Partial<ImportedEvent> | null = null;

  for (const line of unfold(ics)) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current?.summary && current.startsAtUtc) {
        events.push({
          externalId: current.externalId ?? null,
          summary: current.summary,
          location: current.location ?? "",
          startsAtUtc: current.startsAtUtc,
          endsAtUtc: current.endsAtUtc ?? null,
          rrule: current.rrule ?? null,
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const name = line.slice(0, colon).split(";")[0].toUpperCase();
    const value = line.slice(colon + 1);
    if (name === "UID") current.externalId = value;
    else if (name === "SUMMARY") current.summary = unescapeText(value);
    else if (name === "LOCATION") current.location = unescapeText(value);
    else if (name === "DTSTART") current.startsAtUtc = parseIcsDate(value) ?? undefined;
    else if (name === "DTEND") current.endsAtUtc = parseIcsDate(value) ?? undefined;
    else if (name === "RRULE") current.rrule = value;
  }
  return events;
}

/** Universal CSV fallback: header names are case-insensitive and rows are RFC-4180 quoted. */
export function parseCsvSchedule(csv: string): ImportedEvent[] {
  const rows = parseCsvRows(csv);
  const headers = rows.shift()?.map((value) => value.trim().toLowerCase()) ?? [];
  const index = (name: string) => headers.indexOf(name);
  const summaryIndex = index("summary");
  const startsIndex = index("starts_at");
  if (summaryIndex < 0 || startsIndex < 0) {
    throw new Error("CSV schedule requires summary and starts_at columns");
  }

  return rows.flatMap((row) => {
    const startsAtUtc = new Date(row[startsIndex] ?? "");
    if (!row[summaryIndex]?.trim() || Number.isNaN(startsAtUtc.getTime())) return [];
    const endsAtUtc = index("ends_at") >= 0 ? new Date(row[index("ends_at")] ?? "") : null;
    return [{
      externalId: index("id") >= 0 ? row[index("id")] || null : null,
      summary: row[summaryIndex].trim(),
      location: index("location") >= 0 ? row[index("location")] ?? "" : "",
      startsAtUtc,
      endsAtUtc: endsAtUtc && !Number.isNaN(endsAtUtc.getTime()) ? endsAtUtc : null,
      rrule: index("rrule") >= 0 ? row[index("rrule")] || null : null,
    }];
  });
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    if (char === '"' && quoted && csv[i + 1] === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && csv[i + 1] === "\n") i += 1;
      row.push(value);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export interface ScheduleRecord extends ImportedEvent {
  origin: "native" | "synced";
  source: string;
}

/**
 * Replace one integration's synced segment without touching native inventory.
 * Native rows win exact start-time conflicts, preventing a sync from changing
 * inventory that the provider deliberately manages in-platform.
 */
export function reconcileSchedule(
  current: ScheduleRecord[],
  source: string,
  incoming: ImportedEvent[],
): ScheduleRecord[] {
  const retained = current.filter((event) => event.origin === "native" || event.source !== source);
  const nativeStarts = new Set(
    retained
      .filter((event) => event.origin === "native")
      .map((event) => event.startsAtUtc.toISOString()),
  );
  const dedupe = new Set<string>();
  const synced = incoming.flatMap((event) => {
    const key = event.externalId ?? `${event.startsAtUtc.toISOString()}:${event.summary}`;
    if (nativeStarts.has(event.startsAtUtc.toISOString()) || dedupe.has(key)) return [];
    dedupe.add(key);
    return [{ ...event, origin: "synced" as const, source }];
  });
  return [...retained, ...synced].sort(
    (a, b) => a.startsAtUtc.getTime() - b.startsAtUtc.getTime(),
  );
}
