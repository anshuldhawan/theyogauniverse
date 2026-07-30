/**
 * Per-request listing/provider view model: joins the provider, its primary
 * listing, its Organisation's payout eligibility and the viewing buyer into
 * the derived transactability state (DM-7), and expresses the PRO-13 rule:
 * the ONLY UI difference between bookable and advertising-only is the CTA
 * and a neutral explanation line — never a badge or downgrade treatment.
 */

import { formatMoney, formatPriceRange } from "./money";
import { organisationById, primaryListingOf } from "./repo";
import { allStyleTerms } from "./taxonomy";
import { evaluateListing, type BuyerContext } from "./transactability";
import type {
  Provider,
  ProviderCategory,
  Listing,
  ScheduleRow,
  Transactability,
} from "./types";

export interface ProviderView {
  provider: Provider;
  listing: Listing | null;
  transactability: Transactability;
  cta: "book" | "enquire";
  /** Bookable: exact price. Advertising-only: indicative range (LST-14). */
  priceDisplay: string | null;
  priceIsIndicative: boolean;
}

export function providerView(provider: Provider, buyer: BuyerContext): ProviderView {
  const listing = primaryListingOf(provider.id) ?? null;
  const organisation = organisationById(provider.organisationId);

  let transactability: Transactability = "enquiry_only";
  if (listing && organisation) {
    transactability = evaluateListing(
      {
        supplyType: listing.supplyType,
        performanceCountry: listing.performanceCountry,
        organisationEligibility: organisation.payoutEligibility,
      },
      buyer,
    ).state;
  }

  // Retreats and trainings in the seed set use enquiry/application CTAs in
  // the prototype; on-platform they follow transactability like everything else.
  const bookable = transactability === "bookable";

  let priceDisplay: string | null = null;
  let priceIsIndicative = false;
  if (listing?.donationBased) {
    priceDisplay = "Donation-based";
  } else if (bookable && listing?.price) {
    priceDisplay = formatMoney(listing.price);
  } else if (listing?.indicativeRange) {
    priceDisplay = formatPriceRange(listing.indicativeRange);
    priceIsIndicative = true; // must be labelled as indicative wherever shown
  }

  return {
    provider,
    listing,
    transactability,
    cta: bookable ? "book" : "enquire",
    priceDisplay,
    priceIsIndicative,
  };
}

/* ------------------------------------------------------------ presentation */

const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  teacher: "Teacher",
  studio: "Studio",
  retreat: "Retreat",
  training: "Teacher training",
  breathwork: "Breathwork",
  meditation: "Meditation",
};

export function categoryLabel(category: ProviderCategory): string {
  return CATEGORY_LABELS[category];
}

export function formatLabel(format: Provider["format"]): string {
  if (format === "both") return "In person & online";
  if (format === "online") return "Online";
  return "In person";
}

/** "Online, worldwide" for online-only listings, otherwise "City, Country". */
export function locationLine(provider: Provider): string {
  if (provider.onlineOnly) return "Online, worldwide";
  return [provider.cityName, provider.countryName].filter(Boolean).join(", ");
}

/** Location plus format, except online-only listings which never double-print it. */
export function placeLine(provider: Provider): string {
  if (provider.onlineOnly) return locationLine(provider);
  return `${locationLine(provider)} · ${formatLabel(provider.format)}`;
}

/** Place line plus a per-kind experience suffix, for the profile hero. */
export function metaLine(provider: Provider, now = new Date()): string {
  const since = now.getFullYear() - provider.yearsRunning;
  const suffix =
    provider.category === "studio"
      ? `open since ${since}`
      : provider.category === "retreat" || provider.category === "training"
        ? `running since ${since}`
        : `${provider.yearsRunning} years teaching`;
  return `${placeLine(provider)} · ${suffix}`;
}

export function styleLabels(slugs: string[]): string[] {
  const terms = allStyleTerms();
  return slugs.map((slug) => terms.find((t) => t.slug === slug)?.label ?? slug);
}

/** "mon–fri, saturday, sunday" — the one-line timetable digest on result cards. */
export function scheduleSummary(schedule: ScheduleRow[]): string {
  return schedule.map((row) => row.day.toLowerCase()).join(", ");
}

/** CRD-1: anything above self-declared has had documents or a registry checked. */
export function isVerified(provider: Provider): boolean {
  return provider.verificationTier !== "self_declared";
}

export interface ProfileCopy {
  philosophyLabel: string;
  scheduleTitle: string;
  reviewsTitle: string;
  enquireLabel: string;
  classesTitle: string;
}

const PROFILE_COPY: Record<ProviderCategory, ProfileCopy> = {
  teacher: {
    philosophyLabel: "Teaching philosophy",
    scheduleTitle: "Weekly timetable",
    reviewsTitle: "What students say",
    enquireLabel: "Ask a question",
    classesTitle: "Book a class",
  },
  studio: {
    philosophyLabel: "What this studio is for",
    scheduleTitle: "Timetable",
    reviewsTitle: "What members say",
    enquireLabel: "Ask a question",
    classesTitle: "Book a class",
  },
  retreat: {
    philosophyLabel: "What this retreat is for",
    scheduleTitle: "Upcoming dates",
    reviewsTitle: "What past guests say",
    enquireLabel: "Enquire about dates",
    classesTitle: "Book a place",
  },
  training: {
    philosophyLabel: "What this training is for",
    scheduleTitle: "Dates & structure",
    reviewsTitle: "What graduates say",
    enquireLabel: "Apply or ask a question",
    classesTitle: "Book a place",
  },
  breathwork: {
    philosophyLabel: "Teaching philosophy",
    scheduleTitle: "Weekly timetable",
    reviewsTitle: "What students say",
    enquireLabel: "Ask a question",
    classesTitle: "Book a session",
  },
  meditation: {
    philosophyLabel: "Teaching philosophy",
    scheduleTitle: "Weekly timetable",
    reviewsTitle: "What students say",
    enquireLabel: "Ask a question",
    classesTitle: "Book a sitting",
  },
};

export function profileCopy(category: ProviderCategory): ProfileCopy {
  return PROFILE_COPY[category];
}
