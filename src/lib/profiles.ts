import { z } from "zod";

const urlSchema = z.string().url();

export const teacherProfileDetailsSchema = z.object({
  pronouns: z.string().max(80).nullable(),
  photoUrl: urlSchema.nullable(),
  coverMediaUrl: urlSchema.nullable(),
  shortBio: z.string().max(160),
  longBio: z.string(),
  philosophy: z.string(),
  yearsTeaching: z.number().int().min(0).nullable(),
  lineage: z.array(
    z.object({
      teacherOrTradition: z.string().min(1),
      linkedProviderId: z.string().nullable(),
    }),
  ),
  modalities: z.array(z.string()),
  languages: z.array(z.string()),
  adjustmentPolicy: z.string().nullable(),
  consentApproach: z.string().nullable(),
  videoIntroductionUrl: urlSchema.nullable(),
  galleryUrls: z.array(urlSchema),
});

export const studioProfileDetailsSchema = z.object({
  openingHours: z.record(z.string(), z.string()),
  rooms: z.array(z.object({ name: z.string(), capacity: z.number().int().positive() })),
  amenities: z.array(z.string()),
  accessibility: z.array(z.string()),
  heatedYoga: z.boolean(),
  houseRules: z.string().nullable(),
  cancellationPolicy: z.string().nullable(),
  transportDirections: z.string().nullable(),
});

export const schoolProfileDetailsSchema = z.object({
  registryId: z.string().nullable(),
  programmeIds: z.array(z.string()),
  leadTeacherIds: z.array(z.string()),
  contactHours: z.number().int().nonnegative(),
  curriculumOutline: z.string(),
  accommodationOptions: z.array(z.string()),
  graduateOutcomes: z.string().nullable(),
  cohortDates: z.array(z.string().date()),
});

export interface Affiliation {
  id: string;
  teacherProviderId: string;
  studioProviderId: string;
  confirmedByTeacherAt: Date | null;
  confirmedByStudioAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
}

export interface CompletenessInput {
  name?: string | null;
  shortBio?: string | null;
  longBio?: string | null;
  photoUrl?: string | null;
  styles?: string[];
  languages?: string[];
  contact?: string | null;
  scheduleCount?: number;
  credentialCount?: number;
}

const COMPLETENESS_FIELDS: {
  key: keyof CompletenessInput;
  weight: number;
  complete: (value: CompletenessInput[keyof CompletenessInput]) => boolean;
}[] = [
  { key: "name", weight: 10, complete: present },
  { key: "shortBio", weight: 10, complete: present },
  { key: "longBio", weight: 10, complete: present },
  { key: "photoUrl", weight: 15, complete: present },
  { key: "styles", weight: 10, complete: nonEmptyArray },
  { key: "languages", weight: 10, complete: nonEmptyArray },
  { key: "contact", weight: 10, complete: present },
  { key: "scheduleCount", weight: 15, complete: positiveNumber },
  { key: "credentialCount", weight: 10, complete: positiveNumber },
];

export function profileCompleteness(input: CompletenessInput) {
  const missing: string[] = [];
  let score = 0;
  for (const field of COMPLETENESS_FIELDS) {
    if (field.complete(input[field.key])) score += field.weight;
    else missing.push(field.key);
  }
  return { score, missing, nextAction: missing[0] ?? null };
}

/** PRO-2 deterministic collision order: name, name-city, then numeric suffix. */
export function generateProviderSlug(
  name: string,
  city: string | null,
  unavailable: ReadonlySet<string>,
): string {
  const base = slugify(name);
  if (!unavailable.has(base)) return base;
  const cityCandidate = city ? `${base}-${slugify(city)}` : base;
  if (city && !unavailable.has(cityCandidate)) return cityCandidate;
  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${cityCandidate}-${suffix}`;
    if (!unavailable.has(candidate)) return candidate;
  }
}

export function endAffiliation(affiliation: Affiliation, endedAt: Date): Affiliation {
  if (affiliation.endedAt) return affiliation;
  return { ...affiliation, endedAt };
}

export function affiliationIsActive(affiliation: Affiliation, at = new Date()): boolean {
  return (
    affiliation.confirmedByTeacherAt !== null &&
    affiliation.confirmedByStudioAt !== null &&
    (affiliation.startedAt === null || affiliation.startedAt <= at) &&
    (affiliation.endedAt === null || affiliation.endedAt > at)
  );
}

export function previewPath(publicPath: string): string {
  return `${publicPath}${publicPath.includes("?") ? "&" : "?"}preview=visitor`;
}

export function normalizeCustomDomain(domain: string): string {
  const normalized = domain.trim().toLowerCase().replace(/\.$/, "");
  if (
    normalized.includes("/") ||
    !/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(
      normalized,
    )
  ) {
    throw new Error("Invalid custom domain");
  }
  return normalized;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function present(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function positiveNumber(value: unknown): boolean {
  return typeof value === "number" && value > 0;
}
