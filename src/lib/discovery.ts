import { normalize } from "./taxonomy";

export type SearchMode = "location" | "provider" | "time";

export interface DiscoveryDocument {
  id: string;
  type: string;
  name: string;
  city: string;
  neighbourhood?: string;
  destination?: string;
  styles: string[];
  startsAtUtc?: Date;
  endsAtUtc?: Date;
  timezone?: string;
  retreat?: {
    nights: number;
    totalPrice: number;
    accommodation: string;
    foods: string[];
    accreditation?: string;
    hours?: 200 | 300 | 500;
    soloTraveller: boolean;
    alcoholFree: boolean;
    silent: boolean;
    familyFriendly: boolean;
    depositAmount?: number;
    instalments: boolean;
  };
  lastVerifiedAt: Date;
  livenessFailures: number;
}

export interface DiscoveryQuery {
  mode: SearchMode;
  text?: string;
  types?: string[];
  city?: string;
  timePreset?: "tonight" | "tomorrow_morning" | "this_weekend" | "available_now";
  startsAfter?: Date;
  startsBefore?: Date;
  retreat?: Partial<{
    minNights: number;
    maxNights: number;
    maxTotalPrice: number;
    accommodation: string;
    food: string;
    accreditation: string;
    hours: 200 | 300 | 500;
    soloTraveller: boolean;
    alcoholFree: boolean;
    silent: boolean;
    familyFriendly: boolean;
    maxDeposit: number;
    instalments: boolean;
  }>;
}

function editDistance(left: string, right: string): number {
  const rows = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));
  for (let i = 0; i <= left.length; i++) rows[i][0] = i;
  for (let j = 0; j <= right.length; j++) rows[0][j] = j;
  for (let i = 1; i <= left.length; i++) {
    for (let j = 1; j <= right.length; j++) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    }
  }
  return rows[left.length][right.length];
}

export function fuzzyMatch(query: string, candidate: string): boolean {
  const needle = normalize(query);
  const words = normalize(candidate).split(/\s+/);
  return words.some((word) => word.includes(needle) || editDistance(needle, word) <= (needle.length >= 6 ? 2 : 1));
}

function timeBounds(preset: DiscoveryQuery["timePreset"], now: Date): [Date, Date] | null {
  if (!preset) return null;
  const start = new Date(now);
  if (preset === "available_now") return [start, new Date(start.getTime() + 60 * 60_000)];
  if (preset === "tonight") {
    start.setHours(17, 0, 0, 0);
    const end = new Date(start); end.setHours(23, 59, 59, 999);
    return [start, end];
  }
  if (preset === "tomorrow_morning") {
    start.setDate(start.getDate() + 1); start.setHours(5, 0, 0, 0);
    const end = new Date(start); end.setHours(12, 0, 0, 0);
    return [start, end];
  }
  const daysUntilSaturday = (6 - start.getDay() + 7) % 7;
  start.setDate(start.getDate() + daysUntilSaturday); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 2);
  return [start, end];
}

export function searchDiscovery(
  documents: DiscoveryDocument[],
  query: DiscoveryQuery,
  now = new Date(),
): DiscoveryDocument[] {
  const presetBounds = timeBounds(query.timePreset, now);
  return documents.filter((document) => {
    if (query.types?.length && !query.types.includes(document.type)) return false;
    if (query.city && normalize(document.city) !== normalize(query.city)) return false;
    if (query.text && ![document.name, document.city, document.neighbourhood, document.destination, ...document.styles]
      .filter(Boolean).some((value) => fuzzyMatch(query.text!, value!))) return false;
    const after = query.startsAfter ?? presetBounds?.[0];
    const before = query.startsBefore ?? presetBounds?.[1];
    if (after && (!document.startsAtUtc || document.startsAtUtc < after)) return false;
    if (before && (!document.startsAtUtc || document.startsAtUtc >= before)) return false;
    const filter = query.retreat;
    if (filter) {
      const retreat = document.retreat;
      if (!retreat) return false;
      if (filter.minNights !== undefined && retreat.nights < filter.minNights) return false;
      if (filter.maxNights !== undefined && retreat.nights > filter.maxNights) return false;
      if (filter.maxTotalPrice !== undefined && retreat.totalPrice > filter.maxTotalPrice) return false;
      if (filter.accommodation && retreat.accommodation !== filter.accommodation) return false;
      if (filter.food && !retreat.foods.includes(filter.food)) return false;
      if (filter.accreditation && retreat.accreditation !== filter.accreditation) return false;
      if (filter.hours && retreat.hours !== filter.hours) return false;
      for (const key of ["soloTraveller", "alcoholFree", "silent", "familyFriendly", "instalments"] as const) {
        if (filter[key] !== undefined && retreat[key] !== filter[key]) return false;
      }
      if (filter.maxDeposit !== undefined && (retreat.depositAmount ?? Infinity) > filter.maxDeposit) return false;
    }
    return true;
  });
}

export interface ParsedNaturalQuery {
  structured: Partial<DiscoveryQuery>;
  fallbackKeywords: string;
  mappings: { phrase: string; filter: string }[];
}

export function parseNaturalQuery(input: string): ParsedNaturalQuery {
  let remainder = normalize(input);
  const structured: Partial<DiscoveryQuery> = {};
  const mappings: ParsedNaturalQuery["mappings"] = [];
  const presets: [RegExp, DiscoveryQuery["timePreset"]][] = [
    [/\btonight\b/, "tonight"], [/\btomorrow morning\b/, "tomorrow_morning"],
    [/\bthis weekend\b/, "this_weekend"], [/\bavailable now\b/, "available_now"],
  ];
  for (const [pattern, preset] of presets) {
    const match = remainder.match(pattern);
    if (match) {
      structured.timePreset = preset;
      mappings.push({ phrase: match[0], filter: `timePreset=${preset}` });
      remainder = remainder.replace(pattern, " ");
      break;
    }
  }
  const online = remainder.match(/\bonline\b/);
  if (online) {
    structured.types = ["online"];
    mappings.push({ phrase: online[0], filter: "types=online" });
    remainder = remainder.replace(/\bonline\b/, " ");
  }
  return { structured, fallbackKeywords: remainder.replace(/\s+/g, " ").trim(), mappings };
}

export function autosuggest(query: string, documents: DiscoveryDocument[], limit = 8): string[] {
  const values = new Set(documents.flatMap((row) => [row.city, row.neighbourhood, row.name, row.destination, ...row.styles]).filter(Boolean) as string[]);
  return [...values].filter((value) => fuzzyMatch(query, value)).slice(0, limit);
}

export function staleDisposition(
  document: Pick<DiscoveryDocument, "lastVerifiedAt" | "livenessFailures">,
  now: Date,
): "live" | "demote" | "unpublish" {
  const ageDays = (now.getTime() - document.lastVerifiedAt.getTime()) / 86_400_000;
  if (document.livenessFailures >= 3 || ageDays > 365) return "unpublish";
  if (document.livenessFailures > 0 || ageDays > 180) return "demote";
  return "live";
}
