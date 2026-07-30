import { z } from "zod";
import { TAXONOMY_VERSION } from "./taxonomy";

const currencySchema = z.string().regex(/^[A-Z]{3}$/);
const countrySchema = z.string().regex(/^[A-Z]{2}$/);
const moneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: currencySchema,
});

const listingBaseSchema = z.object({
  id: z.string().min(1),
  providerId: z.string().min(1),
  organisationId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  status: z.enum(["draft", "published", "paused", "archived"]).default("draft"),
  visibility: z.enum(["public", "unlisted", "private"]).default("public"),
  scheduledPublishAt: z.coerce.date().nullable().default(null),
  supplyType: z.enum(["in_person", "online_live", "on_demand"]),
  performanceCountry: countrySchema.nullable(),
  price: moneySchema.nullable(),
  indicativeRange: z
    .object({ low: moneySchema, high: moneySchema })
    .nullable()
    .default(null),
  taxonomyVersion: z.string().default(TAXONOMY_VERSION),
  styles: z.array(z.string()).default([]),
  policies: z.record(z.string(), z.unknown()).default({}),
});

const recurringClassSchema = listingBaseSchema.extend({
  type: z.literal("recurring_class"),
  details: z.object({
    rrule: z.string().min(1),
    exdates: z.array(z.string().date()).default([]),
    timezone: z.string().min(1),
    durationMinutes: z.number().int().positive(),
    defaultCapacity: z.number().int().positive(),
    teacherProviderId: z.string().nullable(),
    roomId: z.string().nullable(),
    delivery: z.enum(["in_person", "online", "hybrid"]),
  }),
});

const workshopSchema = listingBaseSchema.extend({
  type: z.literal("workshop"),
  details: z.object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    category: z.enum([
      "workshop",
      "sound_bath",
      "kirtan",
      "satsang",
      "breathwork_journey",
      "ice_bath",
      "cacao_ceremony",
      "masterclass",
    ]),
    seriesDates: z.array(z.coerce.date()).default([]),
  }),
});

const courseSchema = listingBaseSchema.extend({
  type: z.literal("course"),
  details: z.object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    sessionCount: z.number().int().positive(),
    cohortCapacity: z.number().int().positive(),
    attendanceTracking: z.boolean(),
    makeupPolicy: z.string().nullable(),
  }),
});

const roomTypeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  occupancy: z.number().int().positive(),
  inventory: z.number().int().nonnegative(),
  price: moneySchema,
  singleSupplement: moneySchema.nullable(),
});

const retreatSchema = listingBaseSchema.extend({
  type: z.literal("retreat"),
  details: z.object({
    venueId: z.string().nullable(),
    locationText: z.string().min(1),
    departures: z.array(
      z.object({ startsAt: z.coerce.date(), endsAt: z.coerce.date() }),
    ).min(1),
    roomTypes: z.array(roomTypeSchema).min(1),
    inclusions: z.array(z.string()),
    exclusions: z.array(z.string()),
    itinerary: z.array(z.string()),
    whatToBring: z.array(z.string()),
    arrivalInfo: z.string(),
    depositBps: z.number().int().min(0).max(10_000),
    balanceDueDaysBefore: z.number().int().nonnegative(),
    minimumParticipants: z.number().int().positive(),
    maximumParticipants: z.number().int().positive(),
    travelInsurancePrompt: z.boolean(),
  }),
});

const teacherTrainingSchema = listingBaseSchema.extend({
  type: z.literal("teacher_training"),
  details: z.object({
    hours: z.union([z.literal(200), z.literal(300), z.literal(500), z.literal("CE")]),
    registryAccreditation: z.string().nullable(),
    modules: z.array(z.string()).min(1),
    contactHours: z.number().int().nonnegative(),
    leadTeacherId: z.string().min(1),
    prerequisites: z.array(z.string()),
    applicationRequired: z.boolean(),
    cohortCapacity: z.number().int().positive(),
    instalmentCounts: z.array(z.union([z.literal(3), z.literal(6), z.literal(12)])),
    accommodationAddOns: z.array(z.object({ name: z.string(), price: moneySchema })),
    delivery: z.enum(["in_person", "online", "hybrid"]),
  }),
});

const privateSessionSchema = listingBaseSchema.extend({
  type: z.literal("private_session"),
  details: z.object({
    durationOptions: z.array(
      z.object({ minutes: z.number().int().positive(), price: moneySchema }),
    ).min(1),
    locations: z.array(z.enum(["venue", "client_location", "online"])).min(1),
    travelRadiusKm: z.number().nonnegative().nullable(),
    travelSurcharge: moneySchema.nullable(),
    availabilityRule: z.string().min(1),
  }),
});

const onDemandSchema = listingBaseSchema.extend({
  type: z.literal("on_demand"),
  details: z.object({
    mediaType: z.enum(["video", "audio"]),
    privateMediaRef: z.string().min(1),
    chapters: z.array(
      z.object({ title: z.string(), startsAtSeconds: z.number().int().nonnegative() }),
    ),
    durationSeconds: z.number().int().positive(),
    level: z.string(),
    bundleIds: z.array(z.string()),
    signedUrlTtlSeconds: z.number().int().positive().max(86_400),
  }),
});

const venueSchema = listingBaseSchema.extend({
  type: z.literal("venue"),
  details: z.object({
    capacity: z.number().int().positive(),
    rooms: z.array(z.object({ name: z.string(), capacity: z.number().int().positive() })),
    accommodation: z.boolean(),
    catering: z.boolean(),
    availableDates: z.array(z.string().date()),
    dayRateRange: z.object({ low: moneySchema, high: moneySchema }),
  }),
});

export const inventoryListingSchema = z.discriminatedUnion("type", [
  recurringClassSchema,
  workshopSchema,
  courseSchema,
  retreatSchema,
  teacherTrainingSchema,
  privateSessionSchema,
  onDemandSchema,
  venueSchema,
]);

export type InventoryListing = z.infer<typeof inventoryListingSchema>;

export function validateForPublish(listing: InventoryListing): string[] {
  const errors: string[] = [];
  if (listing.supplyType === "in_person" && !listing.performanceCountry) {
    errors.push("In-person listings require a performance country");
  }
  if (listing.supplyType !== "in_person" && listing.performanceCountry) {
    errors.push("Online listings must not set a performance country");
  }
  if (listing.type === "venue" && listing.price) {
    errors.push("Venue listings are advertising-only and cannot carry a transaction price");
  }
  if (listing.indicativeRange) {
    const { low, high } = listing.indicativeRange;
    if (low.currency !== high.currency || low.amount > high.amount) {
      errors.push("Indicative range must use one currency and low must not exceed high");
    }
  }
  return errors;
}

export function publishListing(listing: InventoryListing, now: Date): InventoryListing {
  const errors = validateForPublish(listing);
  if (errors.length) throw new Error(errors.join("; "));
  if (listing.scheduledPublishAt && listing.scheduledPublishAt > now) return listing;
  return { ...listing, status: "published", scheduledPublishAt: null };
}

export function applyScheduledPublishing(
  listings: InventoryListing[],
  now: Date,
): InventoryListing[] {
  return listings.map((listing) =>
    listing.status === "draft" &&
    listing.scheduledPublishAt &&
    listing.scheduledPublishAt <= now
      ? publishListing(listing, now)
      : listing,
  );
}

export function cloneListing(
  listing: InventoryListing,
  identity: { id: string; title?: string },
): InventoryListing {
  return {
    ...structuredClone(listing),
    id: identity.id,
    title: identity.title ?? `${listing.title} (copy)`,
    status: "draft",
    scheduledPublishAt: null,
  };
}

export function bulkPriceChange(
  listings: InventoryListing[],
  amountDelta: number,
): InventoryListing[] {
  if (!Number.isInteger(amountDelta)) throw new Error("Price delta must be integer minor units");
  return listings.map((listing) =>
    listing.price
      ? {
          ...listing,
          price: {
            ...listing.price,
            amount: Math.max(0, listing.price.amount + amountDelta),
          },
        }
      : listing,
  );
}

export function bulkCancelOccurrenceIds(occurrenceIds: string[]) {
  return [...new Set(occurrenceIds)].map((occurrenceId) => ({
    occurrenceId,
    status: "cancelled" as const,
    refundRequired: true,
    notificationRequired: true,
  }));
}

const CSV_COLUMNS = [
  "id",
  "type",
  "title",
  "status",
  "visibility",
  "supplyType",
  "performanceCountry",
  "priceAmount",
  "priceCurrency",
] as const;

export function exportListingsCsv(listings: InventoryListing[]): string {
  const rows = listings.map((listing) => [
    listing.id,
    listing.type,
    listing.title,
    listing.status,
    listing.visibility,
    listing.supplyType,
    listing.performanceCountry ?? "",
    listing.price?.amount.toString() ?? "",
    listing.price?.currency ?? "",
  ]);
  return [CSV_COLUMNS, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

export function parseListingsCsv(csv: string) {
  const rows = parseCsvRows(csv);
  if (!rows.length || rows[0].join(",") !== CSV_COLUMNS.join(",")) {
    throw new Error("Unsupported listing CSV header");
  }
  return rows.slice(1).map((row) => ({
    id: row[0],
    type: row[1],
    title: row[2],
    status: row[3],
    visibility: row[4],
    supplyType: row[5],
    performanceCountry: row[6] || null,
    price:
      row[7] && row[8] ? { amount: Number.parseInt(row[7], 10), currency: row[8] } : null,
  }));
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    if (char === '"') {
      if (quoted && csv[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = "";
    } else value += char;
  }
  row.push(value);
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  if (quoted) throw new Error("Unclosed quoted CSV field");
  return rows;
}
