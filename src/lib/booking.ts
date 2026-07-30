/**
 * BKG — booking engine: state machine (BKG-18), guest checkout (ACC-2),
 * concurrency-safe capacity (BKG-19), commission resolution at purchase
 * (PAY-5), escrow scheduling (PAY-8), tax gating (PAY-10/11), waiver capture
 * before first attendance (WVR-3), ledger postings (PAY-14), idempotency
 * (NFR-11), and the "never render a Book button we can't honour" recheck —
 * transactability is re-evaluated server-side at booking time, not trusted
 * from the page.
 */

import { randomUUID } from "node:crypto";
import { commissionFor, escrowReleaseAt } from "./commission";
import { postBookingCapture, postTransaction } from "./ledger";
import { money, type Money } from "./money";
import { paymentProvider } from "./payments";
import {
  bookingsAll,
  insertBooking,
  listingById,
  organisationById,
  providerBySlug,
  releaseSeat,
  reserveSeat,
  slotById,
  updateBooking,
  bookingByReference,
} from "./repo";
import { resolveTax, type LocationEvidence } from "./tax";
import { evaluateListing } from "./transactability";
import type { Booking, BookingState } from "./types";
import { sendEmail } from "./email";
import { deliverBookingWebhooks, enqueueBookingWebhook } from "./partner-webhooks";
import { notifyBookingUpdate } from "./web-push";

/** BKG-18 — permitted transitions; everything else is rejected and audit-logged. */
const TRANSITIONS: Record<BookingState, BookingState[]> = {
  pending: ["confirmed", "cancelled_by_user", "cancelled_by_provider"],
  confirmed: [
    "attended",
    "no_show",
    "cancelled_by_user",
    "cancelled_by_provider",
    "refunded",
    "disputed",
  ],
  attended: ["disputed"],
  no_show: ["disputed"],
  cancelled_by_user: ["refunded"],
  cancelled_by_provider: ["refunded"],
  refunded: [],
  disputed: ["refunded"],
};

export function canTransition(from: BookingState, to: BookingState): boolean {
  return TRANSITIONS[from].includes(to);
}

export interface CheckoutInput {
  providerSlug: string;
  slotId: string;
  guestName: string;
  guestEmail: string;
  waiverAccepted: boolean;
  idempotencyKey: string;
  evidence: LocationEvidence;
}

export type CheckoutResult =
  | { ok: true; booking: Booking }
  | { ok: false; error: string };

/**
 * Two-phase checkout for rails with client-side confirmation (Stripe hosted
 * fields, PAY-15): `begin` runs every gate, reserves the seat and creates the
 * payment intent; the browser confirms payment; `finalize` verifies the
 * intent with the provider and settles (ledger + confirmation). The mock
 * rail settles inside `begin` (clientSecret null), which keeps the one-shot
 * `checkout()` path working for dev/CI.
 */
export type BeginCheckoutResult =
  | { ok: true; kind: "confirmed"; booking: Booking }
  | { ok: true; kind: "requires_payment"; booking: Booking; clientSecret: string }
  | { ok: false; error: string };

export type FinalizeResult =
  | { status: "confirmed"; booking: Booking }
  | { status: "processing" }
  | { status: "requires_payment" }
  | { status: "failed"; error: string };

function reference(): string {
  return `SH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  const result = await beginCheckout(input);
  if (!result.ok) return result;
  if (result.kind === "requires_payment") {
    // One-shot checkout cannot confirm hosted fields; the caller must use
    // the two-phase flow when the Stripe rail is active.
    return { ok: false, error: "This checkout requires the hosted payment step." };
  }
  return { ok: true, booking: result.booking };
}

export async function beginCheckout(input: CheckoutInput): Promise<BeginCheckoutResult> {
  // NFR-11: same idempotency key returns the same booking, never a double charge.
  const existing = findByIdempotencyKey(input.idempotencyKey);
  if (existing) {
    const booking = bookingByReference(existing.booking.reference) ?? existing.booking;
    if (booking.state === "pending" && existing.clientSecret) {
      return { ok: true, kind: "requires_payment", booking, clientSecret: existing.clientSecret };
    }
    return { ok: true, kind: "confirmed", booking };
  }

  const provider = providerBySlug(input.providerSlug);
  const slot = input.slotId ? slotById(input.slotId) : undefined;
  if (!provider || !slot || slot.providerId !== provider.id) {
    return { ok: false, error: "That class is no longer available." };
  }
  const listing = listingById(slot.listingId);
  const organisation = organisationById(provider.organisationId);
  if (!listing || !organisation) return { ok: false, error: "Listing unavailable." };

  // Server-side transactability recheck at booking time (DM-7).
  const transactability = evaluateListing(
    {
      supplyType: listing.supplyType,
      performanceCountry: listing.performanceCountry,
      organisationEligibility: organisation.payoutEligibility,
    },
    { country: input.evidence.geoIpCountry },
  );
  if (transactability.state !== "bookable") {
    return {
      ok: false,
      error: "This listing can't be booked online. Contact the provider directly.",
    };
  }

  // WVR-3: waiver signature is part of checkout, before first attendance.
  if (!input.waiverAccepted) {
    return { ok: false, error: "Please read and accept the liability waiver." };
  }

  const price: Money = slot.price ?? money(0, "USD");
  const isFree = price.amount === 0;

  // PAY-10/11: tax gate (paid bookings only).
  if (!isFree) {
    const tax = resolveTax({
      supplyType: listing.supplyType,
      performanceCountry: listing.performanceCountry,
      gross: price,
      evidence: input.evidence,
    });
    if (!tax.ok) return { ok: false, error: tax.blockReason ?? "Tax cannot be resolved." };
  }

  // BKG-19: reserve the seat atomically before charging; roll back on failure.
  if (!reserveSeat(slot.id)) {
    return { ok: false, error: "That class just filled up. Try another time." };
  }

  const commission = commissionFor(listing.type, price);

  const booking: Booking = {
    id: randomUUID(),
    reference: reference(),
    slotId: slot.id,
    providerId: provider.id,
    listingId: listing.id,
    state: "pending",
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    price: isFree ? null : price,
    commission: isFree ? null : commission,
    createdAt: new Date().toISOString(),
    waiverVersion: "us-general-v1",
    paymentIntentRef: null,
  };
  registerIdempotencyKey(input.idempotencyKey, booking);
  insertBooking(booking);
  enqueueBookingWebhook(booking);
  void deliverBookingWebhooks();

  if (!isFree) {
    const result = await paymentProvider().createIntent({
      idempotencyKey: input.idempotencyKey,
      amount: price,
      applicationFee: commission,
      connectAccountId: organisation.payoutEligibility.connectAccountId ?? "",
      holdUntil: escrowReleaseAt(listing.type, new Date()),
      buyerEmail: input.guestEmail,
      // PAY-19: billing country steers method resolution; geo IP is the fallback.
      buyerCountry: input.evidence.billingCountry ?? input.evidence.geoIpCountry,
      bookingReference: booking.reference,
      description: `${slot.what} with ${provider.name} (${booking.reference})`,
    });
    if (!result.ok) {
      releaseSeat(slot.id);
      updateBooking(booking.id, { state: "cancelled_by_user" });
      return { ok: false, error: "Payment was declined. No charge was made." };
    }
    booking.paymentIntentRef = result.intentRef;
    updateBooking(booking.id, { paymentIntentRef: result.intentRef });

    if (result.clientSecret) {
      // Stripe rail: the browser confirms in hosted fields; settlement
      // happens in finalizeCheckout once the intent succeeds.
      registerIdempotencyKey(input.idempotencyKey, booking, result.clientSecret);
      return { ok: true, kind: "requires_payment", booking, clientSecret: result.clientSecret };
    }
  }

  const confirmed = settle(booking.id)!;
  return { ok: true, kind: "confirmed", booking: confirmed };
}

/**
 * Verify the payment intent with the rail and settle. Safe to call from the
 * return page and from the payment webhook — settlement is idempotent on the
 * booking state.
 */
export async function finalizeCheckout(referenceCode: string): Promise<FinalizeResult> {
  const booking = bookingByReference(referenceCode);
  if (!booking) return { status: "failed", error: "Booking not found." };
  if (booking.state === "confirmed") return { status: "confirmed", booking };
  if (booking.state !== "pending") {
    return { status: "failed", error: "This booking can no longer be completed." };
  }
  if (!booking.paymentIntentRef) return { status: "failed", error: "No payment on this booking." };

  const status = await paymentProvider().intentStatus(booking.paymentIntentRef);
  if (status === "processing") return { status: "processing" };
  if (status === "requires_payment") return { status: "requires_payment" };
  if (status === "failed") {
    releaseSeat(booking.slotId);
    updateBooking(booking.id, { state: "cancelled_by_user" });
    return { status: "failed", error: "Payment did not complete. No charge was made." };
  }
  const confirmed = settle(booking.id);
  return confirmed
    ? { status: "confirmed", booking: confirmed }
    : { status: "failed", error: "Booking could not be confirmed." };
}

/**
 * Buyer abandoned or replaced a pending hosted-fields session (e.g. went
 * back and picked a different class): free the seat (BKG-19 rollback).
 */
export function abandonCheckout(referenceCode: string): void {
  const booking = bookingByReference(referenceCode);
  if (!booking || booking.state !== "pending") return;
  releaseSeat(booking.slotId);
  updateBooking(booking.id, { state: "cancelled_by_user" });
}

/** Ledger posting (PAY-14), confirmation, and the transactional email. */
function settle(bookingId: string): Booking | undefined {
  const booking = bookingsAll().find((b) => b.id === bookingId);
  if (!booking) return undefined;
  // Idempotency: client finalize and the webhook can race; only the first
  // caller posts the ledger capture and sends the email.
  if (booking.state !== "pending") return booking;
  const slot = slotById(booking.slotId);
  const listing = listingById(booking.listingId);
  const provider = slot ? providerBySlug(booking.providerId) : undefined;

  if (booking.price && booking.commission && listing) {
    postTransaction(
      postBookingCapture({
        transactionId: randomUUID(),
        bookingId: booking.id,
        organisationId: listing.organisationId,
        gross: booking.price,
        commission: booking.commission,
        tax: money(0, booking.price.currency),
        held: escrowReleaseAt(listing.type, new Date()) !== null,
      }),
    );
  }

  const confirmed = updateBooking(booking.id, { state: "confirmed" })!;
  enqueueBookingWebhook(confirmed);
  void deliverBookingWebhooks();

  // MSG-4-adjacent transactional notification (console adapter in dev).
  void sendEmail({
    to: booking.guestEmail,
    subject: `Confirmed: ${slot?.what ?? "your class"} — ${booking.reference}`,
    text:
      `You're booked: ${slot?.what} with ${provider?.name}\n` +
      `${slot?.day} ${slot?.time} · ${slot?.where}\n` +
      `Reference: ${booking.reference}\n\n` +
      `Cancellation: per the policy shown at checkout. Manage your booking: /booking/${booking.reference}`,
  });

  return confirmed;
}

export function transitionBooking(
  referenceCode: string,
  to: BookingState,
): { ok: boolean; error?: string } {
  const booking = bookingByReference(referenceCode);
  if (!booking) return { ok: false, error: "Booking not found" };
  if (!canTransition(booking.state, to)) {
    return { ok: false, error: `Illegal transition ${booking.state} -> ${to} (BKG-18)` };
  }
  const updated = updateBooking(booking.id, { state: to });
  if (updated) {
    enqueueBookingWebhook(updated);
    void deliverBookingWebhooks();
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    void notifyBookingUpdate({
      reference: updated.reference,
      email: updated.guestEmail,
      title: `Booking ${updated.state.replace(/_/g, " ")}`,
      body: `Your booking ${updated.reference} is now ${updated.state.replace(/_/g, " ")}.`,
      url: `${base}/booking/${updated.reference}`,
    });
  }
  if (to === "cancelled_by_user" || to === "cancelled_by_provider") {
    releaseSeat(booking.slotId);
  }
  return { ok: true };
}

/* ----------------------- idempotency (in-memory dev) ----------------------- */

interface IdempotencyEntry {
  booking: Booking;
  clientSecret: string | null;
}

const idempotency = new Map<string, IdempotencyEntry>();

function findByIdempotencyKey(key: string): IdempotencyEntry | undefined {
  return idempotency.get(key);
}

function registerIdempotencyKey(
  key: string,
  booking: Booking,
  clientSecret: string | null = null,
): void {
  idempotency.set(key, { booking, clientSecret });
}
