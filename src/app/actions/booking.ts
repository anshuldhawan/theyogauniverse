"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { track } from "@/lib/analytics";
import { abandonCheckout, beginCheckout, checkout, finalizeCheckout } from "@/lib/booking";
import { ageInYears, evaluateSanctions, isAccountAgeEligible } from "@/lib/compliance";
import { recordSanctionsDecision } from "@/lib/compliance-workflows";
import { BLOCKED_JURISDICTIONS } from "@/lib/config/markets";
import { BLOG_TOUCH_COOKIE } from "@/lib/editorial/attribution";
import { db, hasDatabase, schema } from "@/db";

/** BLG-43: report the confirmation with its blog-assist touch, if any. */
async function trackConfirmed(reference: string): Promise<void> {
  const store = await cookies();
  const blogTouch = store.get(BLOG_TOUCH_COOKIE)?.value ?? null;
  track({
    name: "booking_confirmed",
    subjectTransactability: "bookable",
    payload: { reference, blogAssisted: Boolean(blogTouch), blogArticle: blogTouch },
  });
}

const bookingSchema = z.object({
  providerSlug: z.string().min(1),
  slotId: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  billingCountry: z.string().length(2),
  dateOfBirth: z.string().date(),
  guardianConfirmed: z.literal("on").optional(),
  waiverAccepted: z.literal("on"),
  idempotencyKey: z.string().uuid(),
});

export interface BookingFormState {
  status: "idle" | "error";
  error?: string;
}

interface ParsedBooking {
  providerSlug: string;
  slotId: string;
  name: string;
  email: string;
  billingCountry: string;
  dateOfBirth: string;
  idempotencyKey: string;
}

async function parseAndGate(
  formData: FormData,
): Promise<{ ok: true; data: ParsedBooking; geo: string | null } | { ok: false; error: string }> {
  const parsed = bookingSchema.safeParse({
    providerSlug: formData.get("providerSlug"),
    slotId: formData.get("slotId"),
    name: formData.get("name"),
    email: formData.get("email"),
    billingCountry: formData.get("billingCountry"),
    dateOfBirth: formData.get("dateOfBirth"),
    guardianConfirmed: formData.get("guardianConfirmed") || undefined,
    waiverAccepted: formData.get("waiverAccepted"),
    idempotencyKey: formData.get("idempotencyKey"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please complete every field, including the waiver." };
  }
  if (
    !isAccountAgeEligible({
      dateOfBirth: parsed.data.dateOfBirth,
      country: parsed.data.billingCountry,
    })
  ) {
    return { ok: false, error: "You do not meet the minimum age for this jurisdiction." };
  }
  const age = ageInYears(parsed.data.dateOfBirth);
  if (age !== null && age < 18 && parsed.data.guardianConfirmed !== "on") {
    return { ok: false, error: "Guardian consent is required for this booking." };
  }

  const requestHeaders = await headers();
  const geo =
    requestHeaders.get("x-vercel-ip-country")?.toUpperCase() ??
    (process.env.NODE_ENV !== "production" ? (process.env.DEV_BUYER_COUNTRY ?? "US") : null);

  const sanctions = evaluateSanctions({
    country: geo,
    blockedJurisdictions: BLOCKED_JURISDICTIONS,
    listVersion: "jurisdictions-2026-07-29",
  });
  const sanctionsRow = recordSanctionsDecision("checkout", parsed.data.idempotencyKey, sanctions);
  if (hasDatabase()) {
    await db().insert(schema.sanctionsDecisions).values({
      id: sanctionsRow.id,
      subjectType: sanctionsRow.subjectType,
      subjectRef: sanctionsRow.subjectRef,
      country: sanctionsRow.country,
      outcome: sanctionsRow.outcome,
      reasonCode: sanctionsRow.reasonCode,
      listVersion: sanctionsRow.listVersion,
      decidedBy: "policy-engine",
    });
  }
  if (sanctions.outcome !== "allow") {
    return { ok: false, error: "Checkout is not available in your region." };
  }

  return { ok: true, data: parsed.data, geo };
}

function checkoutInput(data: ParsedBooking, geo: string | null) {
  return {
    providerSlug: data.providerSlug,
    slotId: data.slotId,
    guestName: data.name,
    guestEmail: data.email,
    waiverAccepted: true,
    idempotencyKey: data.idempotencyKey,
    // PAY-11 evidence: geo IP + buyer-declared billing country. The card
    // issuer country is added by the payment provider in production.
    evidence: {
      geoIpCountry: geo,
      billingCountry: data.billingCountry.toUpperCase(),
      cardIssuerCountry: data.billingCountry.toUpperCase(),
    },
  };
}

/** Mock-rail form action (dev/CI without Stripe keys): one-shot checkout. */
export async function createBooking(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const gated = await parseAndGate(formData);
  if (!gated.ok) return { status: "error", error: gated.error };

  const result = await checkout(checkoutInput(gated.data, gated.geo));
  if (!result.ok) return { status: "error", error: result.error };
  await trackConfirmed(result.booking.reference);
  redirect(`/booking/${result.booking.reference}`);
}

export type PaymentSessionResult =
  | { ok: true; reference: string; clientSecret: string | null }
  | { ok: false; error: string };

/**
 * Stripe rail, phase 1 (PAY-15): run every checkout gate, reserve the seat
 * and create the PaymentIntent. The browser confirms it in Stripe-hosted
 * fields; card data never touches this server. `clientSecret: null` means
 * nothing to pay (free class) and the booking is already confirmed.
 */
export async function createPaymentSession(formData: FormData): Promise<PaymentSessionResult> {
  const gated = await parseAndGate(formData);
  if (!gated.ok) return { ok: false, error: gated.error };

  const result = await beginCheckout(checkoutInput(gated.data, gated.geo));
  if (!result.ok) return { ok: false, error: result.error };
  if (result.kind === "confirmed") await trackConfirmed(result.booking.reference);
  return {
    ok: true,
    reference: result.booking.reference,
    clientSecret: result.kind === "requires_payment" ? result.clientSecret : null,
  };
}

/** Buyer replaced a pending payment session (changed class/details mid-flow). */
export async function abandonPaymentSession(reference: string): Promise<void> {
  abandonCheckout(reference);
}

export type FinalizeBookingResult =
  | { ok: true; reference: string }
  | { ok: false; processing: boolean; error: string };

/** Stripe rail, phase 2: verify the intent server-side and settle the booking. */
export async function finalizeBooking(reference: string): Promise<FinalizeBookingResult> {
  const result = await finalizeCheckout(reference);
  switch (result.status) {
    case "confirmed":
      await trackConfirmed(result.booking.reference);
      return { ok: true, reference: result.booking.reference };
    case "processing":
      // Bank-debit style methods settle later; the webhook confirms the
      // booking. Send the buyer to the status page meanwhile.
      return { ok: true, reference };
    case "requires_payment":
      return { ok: false, processing: false, error: "Payment has not completed yet." };
    case "failed":
      return { ok: false, processing: false, error: result.error };
  }
}
