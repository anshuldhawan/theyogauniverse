/**
 * Adapts the prototype dataset (src/data/seed/prototype.json, extracted from
 * docs/design/The Yoga Universe.dc.html) into domain entities for development.
 *
 * All records are provenance="seeded" (DM-3). Only the Brooklyn provider is
 * US-domiciled, so with real transactability rules exactly one seed provider
 * is bookable — which is a faithful demo of the v1.2 model, not a bug.
 */

import prototype from "./seed/prototype.json";
import { CITIES } from "@/lib/config/markets";
import { fromMajor, money, type Money, type PriceRange } from "@/lib/money";
import { normalize, resolveTerm } from "@/lib/taxonomy";
import type {
  BlogPost,
  ClassSlot,
  Listing,
  ListingType,
  Organisation,
  Provider,
  ProviderKind,
  StartPath,
  SupplyType,
} from "@/lib/types";

interface PrototypeListing {
  id: string;
  kind: string;
  name: string;
  city: string;
  country: string;
  styles: string[];
  format: string;
  levels: string[];
  years: number;
  reviewCount: number;
  featured?: boolean;
  tagline: string;
  philosophy: string;
  bio: string;
  address: string;
  facts: { label: string; value: string }[];
  schedule: { day: string; time: string; what: string; where: string }[];
  socials: string[];
  reviews: { text: string; author: string; when: string }[];
}

const data = prototype as unknown as {
  LISTINGS: PrototypeListing[];
  VERIFIED: string[];
  START_PATHS: StartPath[];
  MONEY: Record<string, [string, number]>;
  BOOKABLE: Record<string, boolean>;
  POSTS: BlogPost[];
};

const COUNTRY_ISO: Record<string, { iso: string; currency: string }> = {
  India: { iso: "IN", currency: "INR" },
  UK: { iso: "GB", currency: "GBP" },
  USA: { iso: "US", currency: "USD" },
  Portugal: { iso: "PT", currency: "EUR" },
  Germany: { iso: "DE", currency: "EUR" },
  France: { iso: "FR", currency: "EUR" },
  UAE: { iso: "AE", currency: "AED" },
  Japan: { iso: "JP", currency: "JPY" },
  "South Africa": { iso: "ZA", currency: "ZAR" },
  "—": { iso: "", currency: "GBP" },
};

/** Prototype city → indexed city slug (Appendix A), where one exists. */
const CITY_MAP: Record<string, string> = {
  London: "london",
  Lisbon: "lisbon",
  Berlin: "berlin",
  Bristol: "bristol",
  Manchester: "manchester",
  Brooklyn: "new-york",
};

const CATEGORY_MAP: Record<string, Provider["category"]> = {
  Teacher: "teacher",
  Studio: "studio",
  Retreat: "retreat",
  Training: "training",
  Breathwork: "breathwork",
  Meditation: "meditation",
};

const KIND_MAP: Record<string, ProviderKind> = {
  Teacher: "teacher",
  Studio: "studio",
  Retreat: "organiser",
  Training: "school",
  Breathwork: "teacher",
  Meditation: "teacher",
};

const LISTING_TYPE_MAP: Record<string, ListingType> = {
  Teacher: "recurring_class",
  Studio: "recurring_class",
  Breathwork: "recurring_class",
  Meditation: "recurring_class",
  Retreat: "retreat",
  Training: "teacher_training",
};

function styleSlug(style: string): string {
  const resolved =
    resolveTerm("yogaStyle", style) ??
    resolveTerm("meditationStyle", style) ??
    resolveTerm("breathworkStyle", style) ??
    resolveTerm("modality", style);
  return resolved?.slug ?? normalize(style).replace(/[^a-z0-9]+/g, "-");
}

/** The prototype's deterministic hash — kept so seeded capacities match the design. */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 9973;
  return h;
}

const SEEDED_AT = "2026-07-01T00:00:00.000Z";

function build() {
  const organisations = new Map<string, Organisation>();
  const providers: Provider[] = [];
  const listings: Listing[] = [];
  const slots: ClassSlot[] = [];

  for (const src of data.LISTINGS) {
    const country = COUNTRY_ISO[src.country] ?? { iso: "", currency: "GBP" };
    const onlineOnly = src.city === "Online";
    const citySlug = CITY_MAP[src.city] ?? null;
    const cityConfig = citySlug ? CITIES.find((c) => c.slug === citySlug) : undefined;
    const isUS = country.iso === "US";

    const organisation: Organisation = {
      id: `org-${src.id}`,
      name: src.name,
      payoutEligibility: {
        // Online-only prototype providers are treated as GB-domiciled for the demo.
        domicileCountry: country.iso || "GB",
        connectStatus: isUS ? "active" : "none",
        // With live/test Stripe keys, all seeded US organisations share one
        // sandbox Connect account so destination charges actually route.
        connectAccountId: isUS
          ? (process.env.STRIPE_SEED_CONNECT_ACCOUNT_ID ?? `acct_seed_${src.id}`)
          : null,
      },
      provenance: "seeded",
    };
    organisations.set(organisation.id, organisation);

    const kind = KIND_MAP[src.kind];
    const provider: Provider = {
      id: src.id,
      organisationId: organisation.id,
      kind,
      category: CATEGORY_MAP[src.kind],
      slug: src.id,
      name: src.name,
      citySlug,
      cityName: onlineOnly ? null : (cityConfig?.name ?? src.city),
      country: country.iso || null,
      countryName: src.country === "—" ? null : src.country,
      onlineOnly,
      tagline: src.tagline,
      philosophy: src.philosophy,
      bio: src.bio,
      address: src.address,
      styles: src.styles.map(styleSlug),
      levels: src.levels.map((l) => l.toLowerCase()),
      format:
        src.format === "both" ? "both" : src.format === "online" ? "online" : "in_person",
      yearsRunning: src.years,
      reviewCount: src.reviewCount,
      featured: Boolean(src.featured),
      facts: src.facts,
      schedule: src.schedule,
      socials: src.socials,
      reviews: src.reviews,
      verificationTier: data.VERIFIED.includes(src.id)
        ? "registry_verified"
        : "self_declared",
      provenance: "seeded",
      lastVerifiedAt: SEEDED_AT,
      confidenceScore: 0.9,
      contactEmail: `hello@${src.id}.example.com`,
      website: src.socials.includes("WEBSITE") ? `https://${src.id}.example.com` : null,
    };
    providers.push(provider);

    const moneyRow = data.MONEY[src.country] ?? data.MONEY["—"];
    const basePrice = fromMajor(moneyRow[1], country.currency);
    const supplyType: SupplyType = src.format === "online" ? "online_live" : "in_person";
    const donationBased = src.facts.some(
      (f) =>
        f.value.toLowerCase().includes("donation") || f.value.toLowerCase().includes("no fee"),
    );

    const listing: Listing = {
      id: `lst-${src.id}`,
      providerId: provider.id,
      organisationId: organisation.id,
      type: LISTING_TYPE_MAP[src.kind],
      supplyType,
      performanceCountry: supplyType === "in_person" ? country.iso || null : null,
      title: src.tagline,
      status: "published",
      price: donationBased ? null : basePrice,
      // LST-14: advertising-only listings publish an indicative range in the
      // provider's own currency — never USD by default.
      indicativeRange: donationBased ? null : indicativeRangeFrom(basePrice),
      donationBased,
    };
    listings.push(listing);

    // Mirror the prototype's slotsFor(): deterministic capacity and load.
    const timezone = cityConfig?.timezone ?? "Etc/UTC";
    src.schedule
      .filter(
        (s) =>
          !s.day.includes("APPLICATIONS") && !s.day.includes("INTAKES") && !s.day.includes("COHORT"),
      )
      .forEach((s, i) => {
        const h = hash(src.id + s.day + s.time);
        const capacity = 8 + (h % 6) * 4;
        slots.push({
          id: `${src.id}-${i}`,
          listingId: listing.id,
          providerId: provider.id,
          day: s.day,
          time: s.time,
          what: s.what,
          where: s.where,
          capacity,
          booked: Math.min(capacity, 2 + (h % capacity)),
          price: donationBased ? null : basePrice,
          timezone,
        });
      });
  }

  return {
    organisations,
    providers,
    listings,
    slots,
    posts: data.POSTS,
    startPaths: data.START_PATHS,
    bookableKinds: data.BOOKABLE,
  };
}

function indicativeRangeFrom(base: Money): PriceRange {
  return {
    low: money(Math.round(base.amount * 0.8), base.currency),
    high: money(Math.round(base.amount * 1.5), base.currency),
  };
}

export const seed = build();
