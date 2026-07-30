/**
 * DASH — provider dashboard services.
 *
 * DASH-8: scoping is hide-not-disable. Transaction panels (revenue, bookings,
 * payouts) simply do not render for non-transactable organisations; they are
 * never shown greyed-out as an upsell.
 *
 * DASH-7: the public-page performance panel is load-bearing for advertising-
 * only providers (their entire value from the platform), so it is the one
 * panel every provider always gets.
 */

import {
  allProviders,
  bookingsForProvider,
  organisationById,
  outboundContactCount,
  slotsForProvider,
} from "./repo";
import { isPayable } from "./transactability";
import type { Booking, Provider } from "./types";

/**
 * Dev impersonation: Clerk org membership picks the provider in production;
 * in guest mode `?as=<slug>` selects a seed provider (default: first payable).
 */
export function resolveDashboardProvider(asSlug?: string): Provider {
  const providers = allProviders();
  if (asSlug) {
    const match = providers.find((p) => p.slug === asSlug);
    if (match) return match;
  }
  return (
    providers.find((p) => {
      const org = organisationById(p.organisationId);
      return org ? isPayable(org.payoutEligibility) : false;
    }) ?? providers[0]
  );
}

export function providerIsTransactable(provider: Provider): boolean {
  const org = organisationById(provider.organisationId);
  return org ? isPayable(org.payoutEligibility) : false;
}

/** DASH-7 — public-page performance, available to every provider. */
export interface PerformancePanel {
  profileViews30d: number;
  searchImpressions30d: number;
  outboundContacts: number;
  scheduleRows: number;
}

export function performancePanel(provider: Provider): PerformancePanel {
  // Views/impressions come from the analytics store in production; the seed
  // store derives stable demo figures so the panel renders meaningfully.
  const base = provider.reviewCount * 37 + provider.name.length * 11;
  return {
    profileViews30d: 240 + (base % 900),
    searchImpressions30d: 1400 + (base % 4200),
    outboundContacts: outboundContactCount(provider.id),
    scheduleRows: provider.schedule.length,
  };
}

/** Transactable-only figures (hidden entirely for advertising-only, DASH-8). */
export interface TransactionPanel {
  bookings: Booking[];
  confirmedCount: number;
  grossMinor: number;
  commissionMinor: number;
  upcomingCapacity: { slotId: string; what: string; booked: number; capacity: number }[];
}

export function transactionPanel(provider: Provider): TransactionPanel {
  const bookings = bookingsForProvider(provider.id);
  const counted = bookings.filter((b) => b.state === "confirmed" || b.state === "attended");
  return {
    bookings,
    confirmedCount: counted.length,
    grossMinor: counted.reduce((sum, b) => sum + (b.price?.amount ?? 0), 0),
    commissionMinor: counted.reduce((sum, b) => sum + (b.commission?.amount ?? 0), 0),
    upcomingCapacity: slotsForProvider(provider.id).map((s) => ({
      slotId: s.id,
      what: s.what,
      booked: s.booked,
      capacity: s.capacity,
    })),
  };
}

export type OnboardingStep =
  | "profile"
  | "identity"
  | "commercial_mode"
  | "schedule"
  | "publish";

export interface OnboardingState {
  providerId: string;
  domicileCountry: string;
  completed: OnboardingStep[];
  identityVerified: boolean;
  commercialMode: "stripe" | "advertising_only" | null;
  updatedAt: Date;
}

export function requiredOnboardingSteps(state: OnboardingState): OnboardingStep[] {
  return ["profile", "identity", "commercial_mode", "schedule", "publish"];
}

export function nextOnboardingStep(state: OnboardingState): OnboardingStep | null {
  return requiredOnboardingSteps(state).find((step) => !state.completed.includes(step)) ?? null;
}

export function chooseCommercialMode(
  state: OnboardingState,
  mode: "stripe" | "advertising_only",
): OnboardingState {
  if (mode === "stripe" && state.domicileCountry.toUpperCase() !== "US") {
    throw new Error("Stripe marketplace payments are currently available to US organisations only.");
  }
  return {
    ...state,
    commercialMode: mode,
    completed: [...new Set([...state.completed, "commercial_mode" as const])],
    updatedAt: new Date(),
  };
}

export interface StudentRecord {
  id: string;
  providerId: string;
  name: string;
  email: string;
  bookingReferences: string[];
  packs: string[];
  privateNotes: string;
  injuriesFlagged: boolean;
  tags: string[];
}

/** DASH-4: CRM data exists only where bookings create a provider/student relationship. */
export function studentCrm(
  providerId: string,
  transactable: boolean,
  students: StudentRecord[],
): StudentRecord[] {
  if (!transactable) return [];
  return students.filter((student) => student.providerId === providerId);
}

export type TeamRole = "owner" | "admin" | "manager" | "staff";
export interface TeamInvite {
  email: string;
  role: TeamRole;
  expiresAt: Date;
}

export function createTeamInvite(
  email: string,
  role: TeamRole,
  now: Date,
): TeamInvite {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("A valid email is required.");
  return { email: email.toLowerCase(), role, expiresAt: new Date(now.getTime() + 7 * 86_400_000) };
}

export interface ProviderPolicies {
  cancellationHours: number;
  waiverText: string;
  houseRules: string[];
  bookingWindowDays: number;
}

export function validateProviderPolicies(policies: ProviderPolicies): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(policies.cancellationHours) || policies.cancellationHours < 0) {
    errors.push("Cancellation notice must be a non-negative whole number of hours.");
  }
  if (!policies.waiverText.trim()) errors.push("Waiver text is required.");
  if (!Number.isInteger(policies.bookingWindowDays) || policies.bookingWindowDays < 1) {
    errors.push("Booking window must be at least one day.");
  }
  return errors;
}

export const ALL_PROVIDER_MARKETING_TOOLS = ["social_cards", "link_in_bio", "media"] as const;
export const TRANSACTION_MARKETING_TOOLS = [
  "promo_codes",
  "intro_offers",
  "packs_memberships",
  "gift_cards",
] as const;

export function visibleMarketingTools(transactable: boolean): string[] {
  return transactable
    ? [...ALL_PROVIDER_MARKETING_TOOLS, ...TRANSACTION_MARKETING_TOOLS]
    : [...ALL_PROVIDER_MARKETING_TOOLS];
}
