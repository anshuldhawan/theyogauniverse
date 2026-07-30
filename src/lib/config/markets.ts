/**
 * Per-market configuration (NG-5a: geo-specific behaviour is configuration,
 * never code; adding a market must not require a deploy).
 *
 * In production these values are served from Vercel Edge Config / the admin
 * console (ADM-5, ADM-9) with this module as the typed default. The shapes
 * here ARE the contract; the file is the dev fallback.
 */

export type CityTier = "transactional" | "advertising_only";

export interface CityConfig {
  slug: string;
  name: string;
  country: string; // ISO-3166 alpha-2, lowercase (used in URLs)
  countryName: string;
  region: "us" | "eu" | "uk" | "au";
  tier: CityTier;
  timezone: string; // IANA identifier (DM-5)
}

const city = (
  slug: string,
  name: string,
  country: string,
  countryName: string,
  region: CityConfig["region"],
  tier: CityTier,
  timezone: string,
): CityConfig => ({ slug, name, country, countryName, region, tier, timezone });

/** Appendix A — the 50-city index. US 20 transactional; EU/UK/AU advertising-only. */
export const CITIES: CityConfig[] = [
  // United States (20) — transactional
  city("new-york", "New York", "us", "United States", "us", "transactional", "America/New_York"),
  city("los-angeles", "Los Angeles", "us", "United States", "us", "transactional", "America/Los_Angeles"),
  city("san-francisco", "San Francisco Bay Area", "us", "United States", "us", "transactional", "America/Los_Angeles"),
  city("chicago", "Chicago", "us", "United States", "us", "transactional", "America/Chicago"),
  city("austin", "Austin", "us", "United States", "us", "transactional", "America/Chicago"),
  city("denver", "Denver", "us", "United States", "us", "transactional", "America/Denver"),
  city("boulder", "Boulder", "us", "United States", "us", "transactional", "America/Denver"),
  city("seattle", "Seattle", "us", "United States", "us", "transactional", "America/Los_Angeles"),
  city("portland", "Portland", "us", "United States", "us", "transactional", "America/Los_Angeles"),
  city("boston", "Boston", "us", "United States", "us", "transactional", "America/New_York"),
  city("miami", "Miami", "us", "United States", "us", "transactional", "America/New_York"),
  city("san-diego", "San Diego", "us", "United States", "us", "transactional", "America/Los_Angeles"),
  city("washington-dc", "Washington DC", "us", "United States", "us", "transactional", "America/New_York"),
  city("atlanta", "Atlanta", "us", "United States", "us", "transactional", "America/New_York"),
  city("philadelphia", "Philadelphia", "us", "United States", "us", "transactional", "America/New_York"),
  city("dallas", "Dallas", "us", "United States", "us", "transactional", "America/Chicago"),
  city("houston", "Houston", "us", "United States", "us", "transactional", "America/Chicago"),
  city("nashville", "Nashville", "us", "United States", "us", "transactional", "America/Chicago"),
  city("phoenix-scottsdale", "Phoenix–Scottsdale", "us", "United States", "us", "transactional", "America/Phoenix"),
  city("minneapolis-st-paul", "Minneapolis–St Paul", "us", "United States", "us", "transactional", "America/Chicago"),
  // Continental Europe (20) — index and enquiry only
  city("berlin", "Berlin", "de", "Germany", "eu", "advertising_only", "Europe/Berlin"),
  city("munich", "Munich", "de", "Germany", "eu", "advertising_only", "Europe/Berlin"),
  city("hamburg", "Hamburg", "de", "Germany", "eu", "advertising_only", "Europe/Berlin"),
  city("amsterdam", "Amsterdam", "nl", "Netherlands", "eu", "advertising_only", "Europe/Amsterdam"),
  city("paris", "Paris", "fr", "France", "eu", "advertising_only", "Europe/Paris"),
  city("lyon", "Lyon", "fr", "France", "eu", "advertising_only", "Europe/Paris"),
  city("barcelona", "Barcelona", "es", "Spain", "eu", "advertising_only", "Europe/Madrid"),
  city("madrid", "Madrid", "es", "Spain", "eu", "advertising_only", "Europe/Madrid"),
  city("valencia", "Valencia", "es", "Spain", "eu", "advertising_only", "Europe/Madrid"),
  city("lisbon", "Lisbon", "pt", "Portugal", "eu", "advertising_only", "Europe/Lisbon"),
  city("porto", "Porto", "pt", "Portugal", "eu", "advertising_only", "Europe/Lisbon"),
  city("milan", "Milan", "it", "Italy", "eu", "advertising_only", "Europe/Rome"),
  city("rome", "Rome", "it", "Italy", "eu", "advertising_only", "Europe/Rome"),
  city("copenhagen", "Copenhagen", "dk", "Denmark", "eu", "advertising_only", "Europe/Copenhagen"),
  city("stockholm", "Stockholm", "se", "Sweden", "eu", "advertising_only", "Europe/Stockholm"),
  city("zurich", "Zurich", "ch", "Switzerland", "eu", "advertising_only", "Europe/Zurich"),
  city("vienna", "Vienna", "at", "Austria", "eu", "advertising_only", "Europe/Vienna"),
  city("dublin", "Dublin", "ie", "Ireland", "eu", "advertising_only", "Europe/Dublin"),
  city("prague", "Prague", "cz", "Czechia", "eu", "advertising_only", "Europe/Prague"),
  city("warsaw", "Warsaw", "pl", "Poland", "eu", "advertising_only", "Europe/Warsaw"),
  // United Kingdom (5) — index and enquiry only
  city("london", "London", "gb", "United Kingdom", "uk", "advertising_only", "Europe/London"),
  city("manchester", "Manchester", "gb", "United Kingdom", "uk", "advertising_only", "Europe/London"),
  city("bristol", "Bristol", "gb", "United Kingdom", "uk", "advertising_only", "Europe/London"),
  city("edinburgh", "Edinburgh", "gb", "United Kingdom", "uk", "advertising_only", "Europe/London"),
  city("brighton", "Brighton", "gb", "United Kingdom", "uk", "advertising_only", "Europe/London"),
  // Australia (5) — index and enquiry only
  city("sydney", "Sydney", "au", "Australia", "au", "advertising_only", "Australia/Sydney"),
  city("melbourne", "Melbourne", "au", "Australia", "au", "advertising_only", "Australia/Melbourne"),
  city("byron-bay", "Byron Bay", "au", "Australia", "au", "advertising_only", "Australia/Sydney"),
  city("brisbane", "Brisbane", "au", "Australia", "au", "advertising_only", "Australia/Brisbane"),
  city("perth", "Perth", "au", "Australia", "au", "advertising_only", "Australia/Perth"),
];

export function cityBySlug(country: string, slug: string): CityConfig | undefined {
  return CITIES.find((c) => c.country === country && c.slug === slug);
}

/**
 * PAY-11a — Track B per-region enablement. The only enabled region in v1 is
 * the US (Decision #12: every other region ships disabled and stays
 * disabled). Enabling a region here without a completed tax registration is
 * a compliance failure (COMP-15), which is why the value carries the
 * registration reference.
 */
export interface TrackBRegionFlag {
  enabled: boolean;
  /** Registration reference; required to enable (COMP-15 sequencing rule). */
  registrationRef: string | null;
}

export const TRACK_B_REGIONS: Record<string, TrackBRegionFlag> = {
  US: { enabled: true, registrationRef: "us-marketplace-facilitator" },
  EU: { enabled: false, registrationRef: null },
  GB: { enabled: false, registrationRef: null },
  AU: { enabled: false, registrationRef: null },
  // Any other buyer region defaults to disabled (see trackBEnabledForBuyer).
};

export function trackBEnabledForBuyer(buyerCountry: string | null): boolean {
  if (!buyerCountry) return false; // PAY-11: where evidence is missing, do not guess.
  const region = buyerRegionOf(buyerCountry);
  return TRACK_B_REGIONS[region]?.enabled ?? false;
}

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
]);

export function buyerRegionOf(buyerCountry: string): string {
  const cc = buyerCountry.toUpperCase();
  if (cc === "US") return "US";
  if (cc === "GB") return "GB";
  if (cc === "AU") return "AU";
  if (EU_COUNTRIES.has(cc)) return "EU";
  return cc;
}

/**
 * PAY-2: payout eligibility by country — a hard gate, no override.
 * Kept as config so that enabling payouts in country N is a config event
 * (NG-6 intent: extend later without re-architecture).
 */
export const PAYOUT_ELIGIBLE_COUNTRIES = new Set(["US"]);

/** PAY-5 — commission rates in basis points, resolved from listing type at purchase. */
export const COMMISSION_BPS: { highTicket: number; highFrequency: number } = {
  highTicket: 1200, // 12%: retreats, trainings, CE, immersions
  highFrequency: 500, // 5%: classes, workshops, courses, privates, online, on-demand, packs, memberships
};

/** PAY-19 / Appendix B — buyer payment methods by region (config, re-verified on a cadence). */
export const PAYMENT_METHODS_BY_REGION: Record<string, string[]> = {
  US: ["card", "apple_pay", "google_pay", "link", "ach_debit"],
  EU: ["card", "apple_pay", "google_pay", "link", "klarna"],
  GB: ["card", "apple_pay", "google_pay", "link", "klarna"],
  AU: ["card", "apple_pay", "google_pay", "link"],
  DEFAULT: ["card", "apple_pay", "google_pay", "link"],
};

/** Appendix B — presentment currencies by buyer region (settlement is always USD, PAY-3). */
export const PRESENTMENT_CURRENCIES: Record<string, string[]> = {
  US: ["USD"],
  EU: ["EUR", "CHF", "SEK", "DKK", "CZK", "PLN"],
  GB: ["GBP"],
  AU: ["AUD"],
  DEFAULT: ["USD"],
};

/**
 * SRCH-16 — transactability demotion factor. A fixed score multiplier in the
 * 0.80–0.85 band, versioned and A/B tested within the band (ANL-4), and
 * published under EU P2B (COMP-9).
 */
export const RANKING_CONFIG = {
  version: "2026-07.1",
  advertisingOnlyMultiplier: 0.82,
  advertisingOnlyMultiplierBand: [0.8, 0.85] as const,
};

/** PAY-18 / COMP-16 — sanctioned jurisdictions blocked at checkout and enquiry. */
export const BLOCKED_JURISDICTIONS = new Set(["CU", "IR", "KP", "SY", "RU", "BY"]);
