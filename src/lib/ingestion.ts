/**
 * ING — ingestion pipeline services.
 *
 * ING-2: entity resolution — candidate records are matched against existing
 * providers on normalised name + geography before insert, so re-crawls update
 * rather than duplicate.
 * ING-5 / Art. 14 GDPR: when a seeded provider has a discoverable contact
 * address, a transparency notice is due within one month of ingestion; the
 * record carries that obligation explicitly.
 * ING-7: opt-out — a provider who objects is suppressed (not deleted:
 * we keep a tombstone so re-crawls do not resurrect them).
 * ING-9: freshness — seeded data past its verification window is stale and
 * must degrade honestly on public surfaces.
 */

import type { Provider } from "./types";

export interface CandidateRecord {
  name: string;
  citySlug: string | null;
  country: string | null;
  sourceUrl: string;
  contactEmail: string | null;
  fetchedAt: string; // ISO
  website?: string | null;
  socialHandles?: string[];
  styles?: string[];
  statedCredentials?: string[];
  openingHours?: Record<string, string>;
  schedule?: unknown;
  price?: unknown;
  images?: string[];
}

/** Casefold, strip diacritics/punctuation, collapse whitespace and stopwords. */
export function normaliseName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(yoga|studio|school|shala|center|centre|the)\b/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type ResolutionOutcome =
  | { kind: "match"; providerId: string }
  | { kind: "new" }
  | { kind: "review"; providerId: string; reason: string };

/**
 * ING-2 entity resolution. Exact normalised-name match in the same city is a
 * confident match; a name match in a different city goes to human review
 * (chains and common names are real); otherwise the record is new.
 */
export function resolveEntity(
  candidate: CandidateRecord,
  existing: Pick<Provider, "id" | "name" | "citySlug">[],
): ResolutionOutcome {
  const key = normaliseName(candidate.name);
  if (!key) return { kind: "new" };
  for (const provider of existing) {
    if (normaliseName(provider.name) !== key) continue;
    if (provider.citySlug === candidate.citySlug) {
      return { kind: "match", providerId: provider.id };
    }
    return {
      kind: "review",
      providerId: provider.id,
      reason: `Name matches ${provider.name} but city differs — possible chain or namesake.`,
    };
  }
  return { kind: "new" };
}

/* ------------------------- Art. 14 transparency (ING-5) ------------------- */

export interface Article14Obligation {
  dueBy: string; // ISO — one month after ingestion
  channel: "email" | "none_discoverable";
}

export function article14Obligation(candidate: CandidateRecord): Article14Obligation {
  const fetched = new Date(candidate.fetchedAt);
  const dueBy = new Date(
    Date.UTC(fetched.getUTCFullYear(), fetched.getUTCMonth() + 1, fetched.getUTCDate()),
  ).toISOString();
  return { dueBy, channel: candidate.contactEmail ? "email" : "none_discoverable" };
}

/* ------------------------------ opt-out (ING-7) ---------------------------- */

const optOutTombstones = new Set<string>();

export function recordOptOut(nameAndCity: { name: string; citySlug: string | null }): void {
  optOutTombstones.add(`${normaliseName(nameAndCity.name)}|${nameAndCity.citySlug ?? ""}`);
}

/** Checked at ingest time so re-crawls never resurrect an opted-out provider. */
export function isOptedOut(candidate: CandidateRecord): boolean {
  return optOutTombstones.has(`${normaliseName(candidate.name)}|${candidate.citySlug ?? ""}`);
}

/* ----------------------------- freshness (ING-9) --------------------------- */

export const FRESHNESS_WINDOW_DAYS = 180;

export function isStale(provider: Pick<Provider, "lastVerifiedAt" | "provenance">, now: Date): boolean {
  if (provider.provenance !== "seeded") return false; // claimed data is owner-maintained
  const verified = new Date(provider.lastVerifiedAt);
  return now.getTime() - verified.getTime() > FRESHNESS_WINDOW_DAYS * 86_400_000;
}

export const DURABLE_FIELDS = [
  "name",
  "citySlug",
  "country",
  "contactEmail",
  "website",
  "socialHandles",
  "styles",
  "statedCredentials",
  "openingHours",
] as const;

export interface FieldProvenance {
  sourceUrl: string;
  method: "crawler" | "api" | "authorised_sync" | "manual";
  observedAt: string;
  agentVersion: string;
}

export interface StagedRecord {
  id: string;
  payload: Partial<CandidateRecord>;
  fieldProvenance: Record<string, FieldProvenance>;
  confidenceScore: number;
  resolution: ResolutionOutcome;
  status: "staged" | "needs_review" | "publishable" | "suppressed";
  rejectedFields: string[];
}

export interface SourcePolicy {
  sourceId: string;
  baseUrl: string;
  robotsAllowed: boolean;
  termsPermitIngestion: boolean;
  requestsPerMinute: number;
  reviewedAt: string;
  notes: string;
}

export function sourceMayRun(policy: SourcePolicy): { allowed: boolean; reason?: string } {
  if (!policy.robotsAllowed) return { allowed: false, reason: "robots.txt prohibits ingestion" };
  if (!policy.termsPermitIngestion) return { allowed: false, reason: "source terms prohibit ingestion" };
  if (!Number.isFinite(policy.requestsPerMinute) || policy.requestsPerMinute <= 0) {
    return { allowed: false, reason: "a positive source rate limit is required" };
  }
  return { allowed: true };
}

export interface SourceConnector<T> {
  id: string;
  policy: SourcePolicy;
  fetch: () => Promise<T[]>;
  normalise: (record: T) => CandidateRecord;
}

/** ING-1/3/4/5/8: safe staging gate with field-level provenance. */
export function stageCandidate(
  candidate: CandidateRecord,
  existing: Pick<Provider, "id" | "name" | "citySlug">[],
  provenance: FieldProvenance,
): StagedRecord {
  const resolution = resolveEntity(candidate, existing);
  const rejectedFields = ["schedule", "price", "images"].filter(
    (field) => candidate[field as keyof CandidateRecord] != null,
  );
  const payload = Object.fromEntries(
    DURABLE_FIELDS.flatMap((field) =>
      candidate[field] == null ? [] : [[field, candidate[field]]],
    ),
  ) as Partial<CandidateRecord>;
  const fieldProvenance = Object.fromEntries(
    Object.keys(payload).map((field) => [field, { ...provenance }]),
  );
  const confidenceScore = confidenceForCandidate(candidate, resolution);
  const status = isOptedOut(candidate)
    ? "suppressed"
    : resolution.kind === "review" || confidenceScore < 0.75
      ? "needs_review"
      : "publishable";
  return {
    id: `ing-${crypto.randomUUID()}`,
    payload,
    fieldProvenance,
    confidenceScore,
    resolution,
    status,
    rejectedFields,
  };
}

export function confidenceForCandidate(
  candidate: CandidateRecord,
  resolution: ResolutionOutcome,
): number {
  let score = 0.35;
  if (candidate.citySlug && candidate.country) score += 0.15;
  if (candidate.website) score += 0.15;
  if (candidate.contactEmail) score += 0.1;
  if ((candidate.socialHandles?.length ?? 0) > 0) score += 0.1;
  if (resolution.kind === "match") score += 0.15;
  if (resolution.kind === "review") score -= 0.2;
  return Math.max(0, Math.min(1, score));
}

export async function runConnector<T>(
  connector: SourceConnector<T>,
  existing: Pick<Provider, "id" | "name" | "citySlug">[],
  agentVersion: string,
): Promise<StagedRecord[]> {
  const permission = sourceMayRun(connector.policy);
  if (!permission.allowed) throw new Error(permission.reason);
  const observedAt = new Date().toISOString();
  const records = await connector.fetch();
  return records.map((raw) => {
    const candidate = connector.normalise(raw);
    return stageCandidate(candidate, existing, {
      sourceUrl: candidate.sourceUrl,
      method: "crawler",
      observedAt,
      agentVersion,
    });
  });
}

export interface LivenessSignals {
  websiteReachable: boolean;
  businessOpen: boolean | null;
  socialActiveAt: Date | null;
}

export function freshnessDisposition(input: {
  provenance: Provider["provenance"];
  lastVerifiedAt: Date;
  now: Date;
  advertisingOnly: boolean;
  signals: LivenessSignals;
}): "healthy" | "demote" | "unpublish" {
  if (input.provenance !== "seeded") return "healthy";
  const ageDays = (input.now.getTime() - input.lastVerifiedAt.getTime()) / 86_400_000;
  const weightedAge = ageDays * (input.advertisingOnly ? 1.25 : 1);
  if (!input.signals.websiteReachable || input.signals.businessOpen === false || weightedAge > 180) {
    return "unpublish";
  }
  if (weightedAge > 90 || !input.signals.socialActiveAt) return "demote";
  return "healthy";
}
