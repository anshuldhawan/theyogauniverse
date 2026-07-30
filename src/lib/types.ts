import type { Money, PriceRange } from "./money";

/** DM-3: every entity carries provenance. */
export type Provenance = "seeded" | "claimed" | "native";

/** CRD-1: trust tiers. */
export type VerificationTier = "self_declared" | "document_verified" | "registry_verified";

/** DM-7: derived transactability state. */
export type Transactability = "bookable" | "enquiry_only";

/** DM-8: supply type determines the tax track. */
export type SupplyType = "in_person" | "online_live" | "on_demand";

export type TaxTrack = "A" | "B";

export type ProviderKind = "teacher" | "studio" | "school" | "organiser" | "venue";

export type ListingType =
  | "recurring_class"
  | "workshop"
  | "course"
  | "retreat"
  | "teacher_training"
  | "private_session"
  | "on_demand"
  | "venue";

export type ListingStatus = "draft" | "published" | "paused" | "archived";

/** PAY-2/PAY-4: Connect account lifecycle as we track it. */
export type ConnectStatus = "none" | "onboarding" | "active" | "restricted" | "disabled";

export interface PayoutEligibility {
  /** ISO-3166 alpha-2 of the Organisation's legal domicile (ACC-13). */
  domicileCountry: string;
  connectStatus: ConnectStatus;
  connectAccountId: string | null;
}

export interface Organisation {
  id: string;
  name: string;
  payoutEligibility: PayoutEligibility;
  provenance: Provenance;
}

export interface ProviderFact {
  label: string;
  value: string;
}

export interface ProviderReview {
  text: string;
  author: string;
  when: string;
}

export interface ScheduleRow {
  day: string;
  time: string;
  what: string;
  where: string;
}

/** Directory facet (the prototype's six kinds); orthogonal to ProviderKind. */
export type ProviderCategory =
  | "teacher"
  | "studio"
  | "retreat"
  | "training"
  | "breathwork"
  | "meditation";

export interface Provider {
  id: string;
  organisationId: string;
  kind: ProviderKind;
  category: ProviderCategory;
  slug: string;
  name: string;
  /** City config slug when in an indexed city; null for online-only / non-indexed. */
  citySlug: string | null;
  cityName: string | null;
  country: string | null; // ISO alpha-2 of physical location
  countryName: string | null;
  onlineOnly: boolean;
  tagline: string;
  philosophy: string;
  bio: string;
  address: string;
  styles: string[]; // taxonomy term slugs
  levels: string[];
  format: "in_person" | "online" | "both";
  yearsRunning: number;
  reviewCount: number;
  featured: boolean;
  facts: ProviderFact[];
  schedule: ScheduleRow[];
  socials: string[];
  reviews: ProviderReview[];
  verificationTier: VerificationTier;
  provenance: Provenance;
  lastVerifiedAt: string; // ISO timestamp (DM-3, ING-9)
  confidenceScore: number;
  /** BKG-20: shown directly on advertising-only listings — never masked there. */
  contactEmail: string | null;
  website: string | null;
}

export interface Listing {
  id: string;
  providerId: string;
  organisationId: string;
  type: ListingType;
  supplyType: SupplyType;
  /** ISO alpha-2; required for in-person supply (DM-8). */
  performanceCountry: string | null;
  title: string;
  status: ListingStatus;
  /** Exact price for bookable listings. */
  price: Money | null;
  /** LST-14: indicative range for advertising-only listings, provider currency. */
  indicativeRange: PriceRange | null;
  donationBased: boolean;
}

/** A bookable class slot (demo-level occurrence; SCH engine owns real RRULE occurrences). */
export interface ClassSlot {
  id: string;
  listingId: string;
  providerId: string;
  day: string;
  time: string;
  what: string;
  where: string;
  capacity: number;
  booked: number;
  price: Money | null; // null = donation-based
  timezone: string;
}

/** BKG-18 states. */
export type BookingState =
  | "pending"
  | "confirmed"
  | "attended"
  | "no_show"
  | "cancelled_by_user"
  | "cancelled_by_provider"
  | "refunded"
  | "disputed";

export interface Booking {
  id: string;
  reference: string;
  slotId: string;
  providerId: string;
  listingId: string;
  state: BookingState;
  guestName: string;
  guestEmail: string;
  price: Money | null;
  commission: Money | null;
  /** Payment-rail intent reference; webhooks map disputes/refunds through it (PAY-20). */
  paymentIntentRef: string | null;
  createdAt: string;
  waiverVersion: string | null;
}

export interface BlogPost {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  meta: string;
  tint: string;
  body: string[];
}

export interface StartPath {
  name: string;
  ids: string[];
  post: string;
  note: string;
}
