import { normalize } from "./taxonomy";

export interface GeoResult {
  id: string;
  lat: number;
  lng: number;
}

export function pointInPolygon(point: GeoResult, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function clusterMapResults(
  rows: GeoResult[],
  zoom: number,
): { key: string; lat: number; lng: number; count: number; ids: string[] }[] {
  const cell = Math.max(0.002, 30 / 2 ** Math.max(0, zoom));
  const buckets = new Map<string, GeoResult[]>();
  for (const row of rows) {
    const key = `${Math.floor(row.lat / cell)}:${Math.floor(row.lng / cell)}`;
    buckets.set(key, [...(buckets.get(key) ?? []), row]);
  }
  return [...buckets.entries()].map(([key, values]) => ({
    key,
    lat: values.reduce((sum, value) => sum + value.lat, 0) / values.length,
    lng: values.reduce((sum, value) => sum + value.lng, 0) / values.length,
    count: values.length,
    ids: values.map((value) => value.id),
  }));
}

export interface SavedSearch {
  id: string;
  userId: string;
  queryFingerprint: string;
  channels: ("email" | "web_push")[];
  lastAlertedResultIds: string[];
}

export function savedSearchAlert(
  search: SavedSearch,
  matchingResultIds: string[],
): { newResultIds: string[]; channels: SavedSearch["channels"]; next: SavedSearch } {
  const alerted = new Set(search.lastAlertedResultIds);
  const newResultIds = matchingResultIds.filter((id) => !alerted.has(id));
  return {
    newResultIds,
    channels: newResultIds.length ? search.channels : [],
    next: { ...search, lastAlertedResultIds: [...new Set([...search.lastAlertedResultIds, ...newResultIds])] },
  };
}

export interface ComparisonItem {
  id: string;
  mode: "bookable" | "advertising_only";
  priceLabel: string;
  durationLabel: string;
  inclusions: string[];
  accreditation: string | null;
  rating: number | null;
}

export function comparison(items: ComparisonItem[]): ComparisonItem[] {
  if (items.length < 2 || items.length > 4) throw new Error("Compare between 2 and 4 offerings.");
  if (new Set(items.map((item) => item.id)).size !== items.length) throw new Error("Duplicate comparison item.");
  return items.map((item) => ({ ...item, inclusions: [...item.inclusions].sort() }));
}

export interface MultilingualDocument {
  id: string;
  originalLanguage: string;
  originalText: string;
  translations: Partial<Record<string, string>>;
}

export function multilingualSearch(
  query: string,
  queryExpansions: string[],
  documents: MultilingualDocument[],
  requestedLanguage: string,
): { document: MultilingualDocument; displayText: string; machineTranslated: boolean; originalText: string }[] {
  const terms = [query, ...queryExpansions].map(normalize).filter(Boolean);
  return documents.flatMap((document) => {
    const searchable = [document.originalText, ...Object.values(document.translations)]
      .filter((text): text is string => typeof text === "string")
      .map(normalize);
    if (!terms.some((term) => searchable.some((text) => text.includes(term)))) return [];
    const translation = document.translations[requestedLanguage];
    return [{
      document,
      displayText: translation ?? document.originalText,
      machineTranslated: Boolean(translation && requestedLanguage !== document.originalLanguage),
      originalText: document.originalText,
    }];
  });
}

export const SEARCH_SERVER_P95_BUDGET_MS = 400;

export function percentile(samples: number[], quantile: number): number {
  if (samples.length === 0) throw new Error("At least one timing sample is required.");
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(quantile * sorted.length) - 1)];
}

export async function runSearchLoadHarness(input: {
  iterations: number;
  concurrency: number;
  execute: (iteration: number) => Promise<unknown>;
}): Promise<{ samples: number[]; p95Ms: number; budgetMs: number; passed: boolean }> {
  if (input.iterations < 1 || input.concurrency < 1) throw new Error("Positive load settings required.");
  const samples: number[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(input.concurrency, input.iterations) }, async () => {
      while (next < input.iterations) {
        const iteration = next++;
        const started = performance.now();
        await input.execute(iteration);
        samples.push(performance.now() - started);
      }
    }),
  );
  const p95Ms = percentile(samples, 0.95);
  return { samples, p95Ms, budgetMs: SEARCH_SERVER_P95_BUDGET_MS, passed: p95Ms < SEARCH_SERVER_P95_BUDGET_MS };
}
