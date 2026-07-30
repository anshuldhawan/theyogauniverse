/**
 * Executable compliance policy. This module deliberately records product
 * controls only; it does not represent counsel approval, registration,
 * insurance placement, or a completed regulatory filing.
 */

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentState {
  version: string;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  gpcHonoured: boolean;
  updatedAt: string;
}

export const CONSENT_VERSION = "2026-07-29";

export function resolveConsent(input: {
  analytics: boolean;
  marketing: boolean;
  globalPrivacyControl?: boolean;
  now?: Date;
}): ConsentState {
  const gpc = input.globalPrivacyControl === true;
  return {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: gpc ? false : input.analytics,
    marketing: gpc ? false : input.marketing,
    gpcHonoured: gpc,
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
}

export function mayLoadCategory(
  consent: ConsentState | null,
  category: ConsentCategory,
): boolean {
  if (category === "necessary") return true;
  return consent?.[category] === true;
}

const AGE_OF_MAJORITY_18 = new Set(["US", "AU"]);

export function minimumAccountAge(country: string | null): 16 | 18 {
  return country && AGE_OF_MAJORITY_18.has(country.toUpperCase()) ? 18 : 16;
}

export function isAccountAgeEligible(params: {
  dateOfBirth: string;
  country: string | null;
  today?: Date;
}): boolean {
  const dob = new Date(`${params.dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(dob.getTime())) return false;
  const today = params.today ?? new Date();
  const age = ageInYears(params.dateOfBirth, today);
  return age !== null && age >= minimumAccountAge(params.country);
}

export function ageInYears(dateOfBirth: string, today = new Date()): number | null {
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(dob.getTime())) return null;
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const birthdayPassed =
    today.getUTCMonth() > dob.getUTCMonth() ||
    (today.getUTCMonth() === dob.getUTCMonth() && today.getUTCDate() >= dob.getUTCDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

export const DATA_REQUEST_TYPES = [
  "access",
  "rectification",
  "erasure",
  "portability",
  "objection",
  "sale_sharing_opt_out",
] as const;
export type DataRequestType = (typeof DATA_REQUEST_TYPES)[number];

export const DATA_REQUEST_STATES = [
  "received",
  "identity_verification",
  "in_review",
  "fulfilled",
  "partially_fulfilled",
  "denied",
] as const;
export type DataRequestState = (typeof DATA_REQUEST_STATES)[number];

/** Conservative 30-day operational SLA; extensions require a logged reason. */
export function dataRequestDueAt(receivedAt: Date): Date {
  return new Date(receivedAt.getTime() + 30 * 86_400_000);
}

export interface SanctionsDecision {
  outcome: "allow" | "block" | "manual_review";
  reasonCode: "clear" | "blocked_jurisdiction" | "possible_denied_party_match";
  country: string | null;
  listVersion: string;
}

export function evaluateSanctions(params: {
  country: string | null;
  blockedJurisdictions: ReadonlySet<string>;
  possibleDeniedPartyMatch?: boolean;
  listVersion: string;
}): SanctionsDecision {
  const country = params.country?.toUpperCase() ?? null;
  if (country && params.blockedJurisdictions.has(country)) {
    return { outcome: "block", reasonCode: "blocked_jurisdiction", country, listVersion: params.listVersion };
  }
  if (params.possibleDeniedPartyMatch) {
    return {
      outcome: "manual_review",
      reasonCode: "possible_denied_party_match",
      country,
      listVersion: params.listVersion,
    };
  }
  return { outcome: "allow", reasonCode: "clear", country, listVersion: params.listVersion };
}

export interface QuarterlyTaxControl {
  quarter: string;
  trackBForeignRegionsDisabled: boolean;
  foreignPerformanceListings: number;
  bundledCrossBorderRetreats: number;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export function taxControlExceptions(control: QuarterlyTaxControl): string[] {
  const exceptions: string[] = [];
  if (!control.trackBForeignRegionsDisabled) exceptions.push("Foreign Track B region enabled");
  if (control.foreignPerformanceListings > 0) {
    exceptions.push(`${control.foreignPerformanceListings} foreign-performance listing(s)`);
  }
  if (control.bundledCrossBorderRetreats > 0) {
    exceptions.push(`${control.bundledCrossBorderRetreats} bundled cross-border retreat(s) need counsel review`);
  }
  if (!control.reviewedBy || !control.reviewedAt) exceptions.push("Quarterly finance review not attested");
  return exceptions;
}
