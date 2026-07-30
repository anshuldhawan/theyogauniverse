import { money, type Money } from "./money";

export interface CartItem {
  id: string;
  kind: "booking" | "mat_hire" | "guest" | "other";
  quantity: number;
  unitPrice: Money;
}

export function cartTotal(items: CartItem[]): Money | null {
  if (!items.length) return null;
  const currency = items[0].unitPrice.currency;
  if (items.some((item) => item.unitPrice.currency !== currency || item.quantity < 1)) return null;
  return money(items.reduce((sum, item) => sum + item.quantity * item.unitPrice.amount, 0), currency);
}

export interface Attendee {
  name: string;
  email?: string;
  waiverSignatureId: string | null;
}

export function validateAttendees(attendees: Attendee[]): string[] {
  const errors: string[] = [];
  if (!attendees.length) errors.push("At least one attendee is required.");
  attendees.forEach((attendee, index) => {
    if (!attendee.name.trim()) errors.push(`Attendee ${index + 1} needs a name.`);
    if (!attendee.waiverSignatureId) errors.push(`Attendee ${index + 1} must sign a waiver.`);
  });
  return errors;
}

export interface BookingRequest {
  state: "submitted" | "accepted" | "declined" | "expired";
  questionnaire: Record<string, string>;
  submittedAt: Date;
  expiresAt: Date;
  paymentLink: string | null;
}

export function reviewBookingRequest(
  request: BookingRequest,
  decision: "accept" | "decline",
  paymentLink: string,
  now: Date,
): BookingRequest {
  if (request.state !== "submitted" || now > request.expiresAt) {
    return { ...request, state: now > request.expiresAt ? "expired" : request.state };
  }
  return {
    ...request,
    state: decision === "accept" ? "accepted" : "declined",
    paymentLink: decision === "accept" ? paymentLink : null,
  };
}

export interface RescheduleInput {
  allowed: boolean;
  currentOccurrenceId: string;
  targetOccurrenceId: string;
  targetSeatsAvailable: number;
  priceDifference: Money;
}

export function reschedule(input: RescheduleInput): { ok: boolean; amountDue: Money; releaseOccurrenceId?: string } {
  if (!input.allowed || input.targetSeatsAvailable < 1 || input.currentOccurrenceId === input.targetOccurrenceId) {
    return { ok: false, amountDue: money(0, input.priceDifference.currency) };
  }
  return {
    ok: true,
    amountDue: money(Math.max(0, input.priceDifference.amount), input.priceDifference.currency),
    releaseOccurrenceId: input.currentOccurrenceId,
  };
}

export interface WaitlistOffer {
  mode: "auto_charge" | "hold_and_confirm";
  offeredAt: Date;
  expiresAt: Date;
  state: "offered" | "accepted" | "expired" | "charged";
}

export function resolveWaitlistOffer(
  offer: WaitlistOffer,
  now: Date,
  confirmed: boolean,
): WaitlistOffer {
  if (offer.state !== "offered") return offer;
  if (now > offer.expiresAt) return { ...offer, state: "expired" };
  if (offer.mode === "auto_charge") return { ...offer, state: "charged" };
  return confirmed ? { ...offer, state: "accepted" } : offer;
}

export interface DunningPolicy {
  retryAfterDays: number[];
  autoCancelOnFailure: boolean;
}

export function nextPaymentFailureAction(
  policy: DunningPolicy,
  failedAttempts: number,
  failedAt: Date,
): { action: "retry"; at: Date } | { action: "cancel" | "manual_review" } {
  const delay = policy.retryAfterDays[failedAttempts];
  if (delay !== undefined) {
    return { action: "retry", at: new Date(failedAt.getTime() + delay * 86_400_000) };
  }
  return { action: policy.autoCancelOnFailure ? "cancel" : "manual_review" };
}

export interface IntroOfferClaim {
  userKey: string;
  offerId: string;
}

export function introOfferEligible(
  offerId: string,
  identityKeys: string[],
  historicalClaims: IntroOfferClaim[],
): boolean {
  const keys = new Set(identityKeys.map((key) => key.trim().toLowerCase()).filter(Boolean));
  return !historicalClaims.some((claim) => claim.offerId === offerId && keys.has(claim.userKey.toLowerCase()));
}

export interface CorporateBooking {
  transactability: "bookable" | "enquiry_only";
  seats: number;
  availableSeats: number;
  invoiceTermsDays: 0 | 15 | 30 | 45;
  purchaseOrderReference?: string;
}

export function validateCorporateBooking(input: CorporateBooking): string[] {
  const errors: string[] = [];
  if (input.transactability !== "bookable") errors.push("Corporate checkout is available only for transactable listings.");
  if (input.seats < 2 || input.seats > input.availableSeats) errors.push("Requested seats are unavailable.");
  if (input.invoiceTermsDays > 0 && !input.purchaseOrderReference?.trim()) errors.push("A purchase order reference is required for net terms.");
  return errors;
}
