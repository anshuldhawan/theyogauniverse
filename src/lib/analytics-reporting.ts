import { ADVERTISING_ONLY_EVENTS, type EventName } from "./analytics";

export type ListingMode = "bookable" | "advertising_only";

export interface MarketplaceEvent {
  name:
    | EventName
    | "payment_authorised"
    | "payment_declined"
    | "three_ds_challenged"
    | "three_ds_failed"
    | "booking_cancelled"
    | "booking_no_show"
    | "dispute_opened"
    | "provider_activated"
    | "provider_claimed"
    | "acquisition_cost";
  at: Date;
  listingMode: ListingMode | null;
  city?: string;
  providerId?: string;
  buyerId?: string;
  buyerCountry?: string;
  issuerCountry?: string;
  listingType?: string;
  amountMinor?: number;
  commissionMinor?: number;
  cohort?: string;
}

export interface SupplySnapshot {
  city: string;
  listingMode: ListingMode;
  providerId: string;
  claimed: boolean;
  active: boolean;
  hasAvailability: boolean;
  publishedListings: number;
  totalListings: number;
  verifiedRecords: number;
  totalRecords: number;
  duplicateRecords: number;
  staleRecords: number;
}

export interface RateBreakdown {
  numerator: number;
  denominator: number;
  rate: number | null;
}

export interface MarketplaceKpis {
  gmvMinor: number;
  commissionMinor: number;
  takeRate: number | null;
  bookings: number;
  conversionByStep: Record<string, RateBreakdown>;
  liquidity: RateBreakdown;
  supplyCoverageByCity: Record<string, number>;
  providerActivationRate: RateBreakdown;
  claimRate: RateBreakdown;
  claimRateByProviderCountry: { US: RateBreakdown; nonUS: RateBreakdown };
  repeatBookingRate: RateBreakdown;
  cancellationNoShowRate: RateBreakdown;
  buyerCountryGmv: Record<string, number>;
  authorisationByIssuerCountry: Record<string, RateBreakdown>;
  threeDsByNonUsIssuerCountry: Record<
    string,
    { challengeRate: RateBreakdown; failureRate: RateBreakdown }
  >;
  disputeByIssuerCountryAndListingType: Record<string, RateBreakdown>;
  cacLtvByCohort: Record<string, { cacMinor: number | null; ltvMinor: number | null }>;
  advertisingOnlyReach: Record<string, { impressions: number; profileViews: number; outboundContacts: number }>;
}

function rate(numerator: number, denominator: number): RateBreakdown {
  return { numerator, denominator, rate: denominator === 0 ? null : numerator / denominator };
}

function count(events: MarketplaceEvent[], name: MarketplaceEvent["name"]): number {
  return events.filter((event) => event.name === name).length;
}

function group<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return Object.groupBy(items, key) as Record<string, T[]>;
}

function validAdvertisingEvent(event: MarketplaceEvent): boolean {
  return (
    event.listingMode !== "advertising_only" ||
    (ADVERTISING_ONLY_EVENTS as readonly string[]).includes(event.name)
  );
}

/**
 * ANL-2: governed KPI model. Advertising-only observations are rejected from
 * transactional calculations and exposed only as reach metrics.
 */
export function calculateMarketplaceKpis(
  rawEvents: MarketplaceEvent[],
  supply: SupplySnapshot[],
): MarketplaceKpis {
  const events = rawEvents.filter(validAdvertisingEvent);
  const transactional = events.filter((event) => event.listingMode !== "advertising_only");
  const confirmations = transactional.filter((event) => event.name === "booking_confirmed");
  const gmvMinor = confirmations.reduce((sum, event) => sum + (event.amountMinor ?? 0), 0);
  const commissionMinor = confirmations.reduce(
    (sum, event) => sum + (event.commissionMinor ?? 0),
    0,
  );

  const funnel = [
    "impression",
    "profile_view",
    "booking_started",
    "booking_details_completed",
    "payment_started",
    "booking_confirmed",
    "review_submitted",
  ] as const;
  const conversionByStep: Record<string, RateBreakdown> = {};
  for (let index = 1; index < funnel.length; index += 1) {
    const previous = funnel[index - 1];
    const current = funnel[index];
    conversionByStep[`${previous}_to_${current}`] = rate(
      count(transactional, current),
      count(transactional, previous),
    );
  }

  const transactionalSupply = supply.filter((item) => item.listingMode === "bookable");
  const providers = new Set(transactionalSupply.map((item) => item.providerId));
  const providersWithBookings = new Set(confirmations.map((event) => event.providerId).filter(Boolean));
  const active = transactionalSupply.filter((item) => item.active).length;
  const claimed = supply.filter((item) => item.claimed).length;
  const usSupply = supply.filter((item) => item.city.startsWith("us:"));
  const nonUsSupply = supply.filter((item) => !item.city.startsWith("us:"));

  const bookingsByBuyer = group(
    confirmations.filter((event): event is MarketplaceEvent & { buyerId: string } => Boolean(event.buyerId)),
    (event) => event.buyerId,
  );
  const repeatBuyers = Object.values(bookingsByBuyer).filter((bookings) => bookings.length > 1).length;
  const cancellations =
    count(transactional, "booking_cancelled") + count(transactional, "booking_no_show");

  const buyerCountryGmv: Record<string, number> = {};
  for (const event of confirmations) {
    const country = event.buyerCountry ?? "unknown";
    buyerCountryGmv[country] = (buyerCountryGmv[country] ?? 0) + (event.amountMinor ?? 0);
  }

  const authorisationByIssuerCountry: Record<string, RateBreakdown> = {};
  const paymentAttempts = transactional.filter(
    (event) => event.name === "payment_authorised" || event.name === "payment_declined",
  );
  for (const [country, countryEvents] of Object.entries(
    group(paymentAttempts, (event) => event.issuerCountry ?? "unknown"),
  )) {
    authorisationByIssuerCountry[country] = rate(
      count(countryEvents, "payment_authorised"),
      countryEvents.length,
    );
  }

  const threeDsByNonUsIssuerCountry: MarketplaceKpis["threeDsByNonUsIssuerCountry"] = {};
  const nonUsAttempts = paymentAttempts.filter((event) => event.issuerCountry !== "US");
  for (const [country, countryAttempts] of Object.entries(
    group(nonUsAttempts, (event) => event.issuerCountry ?? "unknown"),
  )) {
    const related = transactional.filter((event) => (event.issuerCountry ?? "unknown") === country);
    const challenges = count(related, "three_ds_challenged");
    threeDsByNonUsIssuerCountry[country] = {
      challengeRate: rate(challenges, countryAttempts.length),
      failureRate: rate(count(related, "three_ds_failed"), challenges),
    };
  }

  const disputes = transactional.filter((event) => event.name === "dispute_opened");
  const disputeByIssuerCountryAndListingType: Record<string, RateBreakdown> = {};
  const bookingGroups = group(
    confirmations,
    (event) => `${event.issuerCountry ?? "unknown"}:${event.listingType ?? "unknown"}`,
  );
  for (const [key, bookings] of Object.entries(bookingGroups)) {
    disputeByIssuerCountryAndListingType[key] = rate(
      disputes.filter(
        (event) => `${event.issuerCountry ?? "unknown"}:${event.listingType ?? "unknown"}` === key,
      ).length,
      bookings.length,
    );
  }

  const cacLtvByCohort: MarketplaceKpis["cacLtvByCohort"] = {};
  const cohorts = new Set(events.map((event) => event.cohort).filter((value): value is string => Boolean(value)));
  for (const cohort of cohorts) {
    const cohortEvents = transactional.filter((event) => event.cohort === cohort);
    const acquiredBuyers = new Set(
      cohortEvents.map((event) => event.buyerId).filter((value): value is string => Boolean(value)),
    );
    const acquisitionCost = cohortEvents
      .filter((event) => event.name === "acquisition_cost")
      .reduce((sum, event) => sum + (event.amountMinor ?? 0), 0);
    const cohortGmv = cohortEvents
      .filter((event) => event.name === "booking_confirmed")
      .reduce((sum, event) => sum + (event.amountMinor ?? 0), 0);
    cacLtvByCohort[cohort] = {
      cacMinor: acquiredBuyers.size ? acquisitionCost / acquiredBuyers.size : null,
      ltvMinor: acquiredBuyers.size ? cohortGmv / acquiredBuyers.size : null,
    };
  }

  const supplyCoverageByCity = Object.fromEntries(
    Object.entries(group(supply, (item) => item.city)).map(([city, rows]) => [
      city,
      rows.filter((row) => row.hasAvailability).length,
    ]),
  );

  const advertisingOnlyReach: MarketplaceKpis["advertisingOnlyReach"] = {};
  const adEvents = events.filter((event) => event.listingMode === "advertising_only");
  for (const [city, cityEvents] of Object.entries(group(adEvents, (event) => event.city ?? "unknown"))) {
    advertisingOnlyReach[city] = {
      impressions: count(cityEvents, "impression"),
      profileViews: count(cityEvents, "profile_view"),
      outboundContacts: count(cityEvents, "outbound_contact"),
    };
  }

  return {
    gmvMinor,
    commissionMinor,
    takeRate: gmvMinor ? commissionMinor / gmvMinor : null,
    bookings: confirmations.length,
    conversionByStep,
    liquidity: rate(providersWithBookings.size, providers.size),
    supplyCoverageByCity,
    providerActivationRate: rate(active, transactionalSupply.length),
    claimRate: rate(claimed, supply.length),
    claimRateByProviderCountry: {
      US: rate(usSupply.filter((item) => item.claimed).length, usSupply.length),
      nonUS: rate(nonUsSupply.filter((item) => item.claimed).length, nonUsSupply.length),
    },
    repeatBookingRate: rate(repeatBuyers, Object.keys(bookingsByBuyer).length),
    cancellationNoShowRate: rate(cancellations, confirmations.length),
    buyerCountryGmv,
    authorisationByIssuerCountry,
    threeDsByNonUsIssuerCountry,
    disputeByIssuerCountryAndListingType,
    cacLtvByCohort,
    advertisingOnlyReach,
  };
}

export interface CityDataQuality {
  city: string;
  listingMode: ListingMode;
  coverage: number;
  freshnessRate: number | null;
  verificationRate: number | null;
  duplicateRate: number | null;
}

/** ANL-3: quality is segmented so advertising decay can never hide in a blend. */
export function calculateDataQuality(supply: SupplySnapshot[]): {
  transactional: CityDataQuality[];
  advertisingOnly: CityDataQuality[];
} {
  const reports = Object.entries(group(supply, (item) => `${item.listingMode}:${item.city}`)).map(
    ([, rows]) => {
      const totals = rows.reduce(
        (acc, row) => ({
          published: acc.published + row.publishedListings,
          total: acc.total + row.totalListings,
          verified: acc.verified + row.verifiedRecords,
          records: acc.records + row.totalRecords,
          duplicates: acc.duplicates + row.duplicateRecords,
          stale: acc.stale + row.staleRecords,
        }),
        { published: 0, total: 0, verified: 0, records: 0, duplicates: 0, stale: 0 },
      );
      return {
        city: rows[0].city,
        listingMode: rows[0].listingMode,
        coverage: totals.total ? totals.published / totals.total : 0,
        freshnessRate: totals.records ? (totals.records - totals.stale) / totals.records : null,
        verificationRate: totals.records ? totals.verified / totals.records : null,
        duplicateRate: totals.records ? totals.duplicates / totals.records : null,
      } satisfies CityDataQuality;
    },
  );
  return {
    transactional: reports.filter((report) => report.listingMode === "bookable"),
    advertisingOnly: reports.filter((report) => report.listingMode === "advertising_only"),
  };
}

export interface Experiment {
  key: string;
  version: string;
  allocation: number;
  variants: ReadonlyArray<{ key: string; weight: number; value: number | string | boolean }>;
}

function hashToUnit(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4_294_967_296;
}

/** ANL-4: deterministic server-side assignment, stable by subject and version. */
export function assignExperiment(
  experiment: Experiment,
  subjectId: string,
): { assigned: false } | { assigned: true; variant: Experiment["variants"][number] } {
  if (experiment.allocation < 0 || experiment.allocation > 1) throw new Error("Allocation must be 0..1");
  const totalWeight = experiment.variants.reduce((sum, variant) => sum + variant.weight, 0);
  if (experiment.variants.length < 2 || Math.abs(totalWeight - 1) > Number.EPSILON * 10) {
    throw new Error("Variant weights must sum to 1");
  }
  const seed = `${experiment.key}:${experiment.version}:${subjectId}`;
  if (hashToUnit(`${seed}:allocation`) >= experiment.allocation) return { assigned: false };
  const bucket = hashToUnit(`${seed}:variant`);
  let cursor = 0;
  for (const variant of experiment.variants) {
    cursor += variant.weight;
    if (bucket < cursor) return { assigned: true, variant };
  }
  return { assigned: true, variant: experiment.variants.at(-1)! };
}

export function validateRankingExperiment(experiment: Experiment): void {
  for (const variant of experiment.variants) {
    if (typeof variant.value !== "number" || variant.value < 0.8 || variant.value > 0.85) {
      throw new Error("SRCH-16 variants must stay within the disclosed 0.80–0.85 band");
    }
  }
}

export type ConsentRegion = "EU_UK" | "OTHER";
export type TrackingPurpose = "essential" | "analytics" | "marketing";

export interface TrackingConsent {
  analytics: boolean;
  marketing: boolean;
  capturedAt: Date | null;
}

/** ANL-5: EU/UK non-essential tracking is denied until affirmative consent. */
export function mayTrack(
  purpose: TrackingPurpose,
  region: ConsentRegion,
  consent: TrackingConsent | null,
): boolean {
  if (purpose === "essential") return true;
  if (region !== "EU_UK") return consent ? consent[purpose] : purpose === "analytics";
  return Boolean(consent?.capturedAt && consent[purpose]);
}

export function trackingPurposeForEvent(name: MarketplaceEvent["name"]): TrackingPurpose {
  if (name === "booking_confirmed" || name === "payment_authorised" || name === "payment_declined") {
    return "essential";
  }
  return "analytics";
}
