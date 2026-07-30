/**
 * Stripe webhook receiver.
 *
 * - `payment_intent.succeeded` — settles the booking (idempotent with the
 *   client-side finalize and the confirmation page).
 * - `payment_intent.canceled` — frees the seat of an abandoned pending booking.
 * - `charge.dispute.created` — moves the booking to `disputed` (PAY-20);
 *   evidence handling happens in the Stripe dashboard in v1.
 * - `charge.refunded` — mirrors a dashboard-initiated full refund into the
 *   booking state machine (BKG-18 guards the transition).
 *
 * Signature verification (NFR): every payload is verified against
 * STRIPE_WEBHOOK_SECRET before any state is touched.
 *
 * Dev-only caveat: `next dev` runs pages and route handlers in separate
 * worker processes, and the in-memory seed store is per-process — a webhook
 * mutation here may not be visible to page renders locally. The buyer flow
 * does not depend on it (client finalize + confirmation-page finalize settle
 * bookings in the page worker). In production the repo layer is Postgres,
 * so this route is the authoritative dispute/refund path.
 */

import type Stripe from "stripe";
import { abandonCheckout, finalizeCheckout, transitionBooking } from "@/lib/booking";
import { bookingByPaymentIntent } from "@/lib/repo";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return Response.json({ error: "webhook not configured" }, { status: 400 });
  }

  const payload = await request.text();

  const { default: StripeSdk } = await import("stripe");
  const stripe = new StripeSdk(process.env.STRIPE_SECRET_KEY ?? "sk_unused");

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return Response.json({ error: "invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object;
      const reference = intent.metadata?.booking_reference;
      if (reference) await finalizeCheckout(reference);
      break;
    }

    case "payment_intent.canceled": {
      const intent = event.data.object;
      const reference =
        intent.metadata?.booking_reference ?? bookingByPaymentIntent(intent.id)?.reference;
      if (reference) abandonCheckout(reference);
      break;
    }

    case "charge.dispute.created": {
      // PAY-20: buyer disputed the charge; the state machine takes it from here.
      const dispute = event.data.object;
      const intentRef =
        typeof dispute.payment_intent === "string"
          ? dispute.payment_intent
          : dispute.payment_intent?.id;
      const booking = intentRef ? bookingByPaymentIntent(intentRef) : undefined;
      if (booking) {
        // Stripe does not guarantee event order: the dispute can arrive
        // before payment_intent.succeeded. Settle the still-pending booking
        // first (idempotent) so confirmed -> disputed is a legal transition.
        if (booking.state === "pending") await finalizeCheckout(booking.reference);
        transitionBooking(booking.reference, "disputed");
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      if (!charge.refunded) break; // partial refund: booking state unchanged
      const intentRef =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      const booking = intentRef ? bookingByPaymentIntent(intentRef) : undefined;
      if (booking) {
        // Same out-of-order guard as disputes (see above).
        if (booking.state === "pending") await finalizeCheckout(booking.reference);
        transitionBooking(booking.reference, "refunded");
      }
      break;
    }

    default:
      break;
  }

  return Response.json({ received: true });
}
