/**
 * REV — verified reviews. Only attendees of completed bookings may review
 * (REV-1); ratings are multi-dimensional (REV-3); attribution separates
 * teacher / studio / listing (REV-5); providers may reply once (REV-6);
 * reviews are never removed for being negative (REV-7 spirit).
 */

import { bookingByReference } from "./repo";

export const RATING_DIMENSIONS = [
  "teaching_quality",
  "communication",
  "space_cleanliness",
  "value",
] as const;

export type RatingDimension = (typeof RATING_DIMENSIONS)[number];

export interface ReviewSubmission {
  bookingReference: string;
  guestEmail: string;
  ratings: Partial<Record<RatingDimension, number>> & Record<string, number | undefined>;
  text: string;
  listingType?: ReviewListingType;
  occurredAt?: Date;
  submittedAt?: Date;
}

export type ReviewValidation = { ok: true } | { ok: false; error: string };

const submittedByBooking = new Set<string>();

export function validateReview(submission: ReviewSubmission): ReviewValidation {
  const booking = bookingByReference(submission.bookingReference);
  if (!booking) return { ok: false, error: "No booking found for that reference (REV-1)." };
  if (booking.guestEmail.toLowerCase() !== submission.guestEmail.toLowerCase()) {
    return { ok: false, error: "Reviews must come from the attendee on the booking (REV-1)." };
  }
  if (booking.state !== "attended") {
    return { ok: false, error: "Only completed bookings can be reviewed (REV-1)." };
  }
  if (submission.occurredAt && submission.submittedAt) {
    const window = reviewWindow(submission.occurredAt, submission.submittedAt);
    if (!window.open) return { ok: false, error: window.reason };
  }
  if (submittedByBooking.has(booking.id)) {
    return { ok: false, error: "This booking has already been reviewed." };
  }
  const entries = Object.entries(submission.ratings);
  if (entries.length === 0) {
    return { ok: false, error: "At least one rating dimension is required (REV-3)." };
  }
  for (const [dimension, value] of entries) {
    const allowed = submission.listingType
      ? REVIEW_DIMENSIONS[submission.listingType]
      : RATING_DIMENSIONS;
    if (!(allowed as readonly string[]).includes(dimension)) {
      return { ok: false, error: `Unknown rating dimension "${dimension}".` };
    }
    if (typeof value !== "number" || value < 1 || value > 5 || !Number.isInteger(value)) {
      return { ok: false, error: "Ratings are integers from 1 to 5." };
    }
  }
  if (submission.text.trim().length < 20) {
    return { ok: false, error: "Please write at least a couple of sentences." };
  }
  return { ok: true };
}

export function markReviewSubmitted(bookingId: string): void {
  submittedByBooking.add(bookingId);
}

/**
 * REV-8: aggregates are only published once a minimum sample exists, and
 * always as a distribution alongside the mean — never a bare star figure.
 */
export const MIN_REVIEW_SAMPLE = 3;

export function canPublishAggregate(reviewCount: number): boolean {
  return reviewCount >= MIN_REVIEW_SAMPLE;
}

export type ReviewListingType = "class" | "retreat" | "training";

export const REVIEW_DIMENSIONS = {
  class: ["teaching_quality", "atmosphere", "facilities", "value", "accuracy"],
  retreat: ["accommodation", "food", "teaching", "location", "group_experience", "value", "accuracy"],
  training: [
    "curriculum_quality",
    "lead_teacher_contact_hours",
    "organisation",
    "support",
    "career_value",
    "accuracy",
  ],
} as const satisfies Record<ReviewListingType, readonly string[]>;

/** REV-2: the attendee has 24 hours–30 days after an occurrence to review. */
export function reviewWindow(
  occurredAt: Date,
  now: Date,
): { open: true; closesAt: Date } | { open: false; reason: string } {
  const elapsed = now.getTime() - occurredAt.getTime();
  if (elapsed < 24 * 3_600_000) {
    return { open: false, reason: "The review window opens 24 hours after the occurrence." };
  }
  if (elapsed > 30 * 86_400_000) {
    return { open: false, reason: "The 30-day review window has closed." };
  }
  return { open: true, closesAt: new Date(occurredAt.getTime() + 30 * 86_400_000) };
}

export interface ReviewAttribution {
  listingId: string;
  teacherProviderId: string | null;
  studioProviderId: string | null;
  substituteProviderId: string | null;
}

/** REV-5: occurrence substitutions determine teacher attribution. */
export function reviewAttribution(input: ReviewAttribution): ReviewAttribution {
  return {
    ...input,
    teacherProviderId: input.substituteProviderId ?? input.teacherProviderId,
  };
}

export interface ReviewFraudSignals {
  reviewsFromIp24h: number;
  reviewsFromDevice24h: number;
  textReuseSimilarity: number;
  discountMentioned: boolean;
  providerLinkedAccount: boolean;
}

export interface FraudAssessment {
  decision: "allow" | "review" | "block";
  score: number;
  reasons: string[];
}

/** REV-9: explainable fraud triage. Suspicions queue review; only velocity blocks. */
export function assessReviewFraud(signals: ReviewFraudSignals): FraudAssessment {
  const reasons: string[] = [];
  let score = 0;
  if (signals.reviewsFromIp24h >= 5) {
    score += 60;
    reasons.push("ip_velocity");
  }
  if (signals.reviewsFromDevice24h >= 3) {
    score += 45;
    reasons.push("device_velocity");
  }
  if (signals.textReuseSimilarity >= 0.85) {
    score += 35;
    reasons.push("text_reuse");
  }
  if (signals.discountMentioned) {
    score += 25;
    reasons.push("review_incentive");
  }
  if (signals.providerLinkedAccount) {
    score += 70;
    reasons.push("provider_linked_account");
  }
  return {
    score,
    reasons,
    decision: signals.reviewsFromIp24h >= 10 ? "block" : score >= 45 ? "review" : "allow",
  };
}

/** REV-10: six-month half-life, bounded so old genuine reviews still contribute. */
export function reviewRecencyWeight(publishedAt: Date, now: Date): number {
  const ageDays = Math.max(0, (now.getTime() - publishedAt.getTime()) / 86_400_000);
  return Math.max(0.15, 2 ** (-ageDays / 180));
}

export interface ReviewLifecycle {
  createdAt: Date;
  editedAt?: Date;
  deletedAt?: Date;
  deletionReason?: string;
  deletedBy?: string;
}

export function canEditReview(review: ReviewLifecycle, now: Date): boolean {
  return !review.deletedAt && now.getTime() - review.createdAt.getTime() <= 24 * 3_600_000;
}

export function moderateReviewDeletion(
  review: ReviewLifecycle,
  input: { reason: string; actor: string; at: Date },
): ReviewLifecycle {
  if (!input.reason.trim() || !input.actor.trim()) throw new Error("A logged T&S reason and actor are required.");
  return { ...review, deletedAt: input.at, deletionReason: input.reason.trim(), deletedBy: input.actor };
}

export interface DisplayTranslation {
  text: string;
  language: string;
  machineTranslated: boolean;
  originalText: string;
  originalLanguage: string;
}

/** REV-12: translations are labelled and never replace the accessible original. */
export function displayReviewTranslation(input: {
  originalText: string;
  originalLanguage: string;
  requestedLanguage: string;
  translatedText?: string;
}): DisplayTranslation {
  const translated =
    input.requestedLanguage !== input.originalLanguage && Boolean(input.translatedText?.trim());
  return {
    text: translated ? input.translatedText!.trim() : input.originalText,
    language: translated ? input.requestedLanguage : input.originalLanguage,
    machineTranslated: translated,
    originalText: input.originalText,
    originalLanguage: input.originalLanguage,
  };
}
