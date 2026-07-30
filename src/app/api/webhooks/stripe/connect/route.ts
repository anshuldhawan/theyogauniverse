/**
 * Stripe Connect webhook receiver (PAY-4 — account health monitoring).
 *
 * Connect events arrive on their own endpoint (configured to "listen on
 * connected accounts" in the Stripe dashboard) with a separate signing
 * secret, STRIPE_CONNECT_WEBHOOK_SECRET.
 *
 * - `account.updated` — Stripe restricted, disabled, or (re)verified a
 *   connected account after onboarding (verification lapse, risk review,
 *   document expiry). The Organisation's connectStatus is re-derived
 *   immediately; because transactability is computed per request from that
 *   status (DM-7), listings drop to `enquiry_only` on the very next render —
 *   within minutes, with no cache to invalidate. Existing confirmed bookings
 *   are untouched (they are honoured), and the provider is notified with a
 *   specific remediation path — never a silent failure.
 */

import type Stripe from "stripe";
import {
  connectRemediation,
  deriveConnectStatus,
  snapshotFromStripeAccount,
} from "@/lib/connect";
import { sendEmail } from "@/lib/email";
import {
  allProviders,
  organisationByConnectAccount,
  updateOrganisationConnect,
} from "@/lib/repo";
import type { ConnectStatus } from "@/lib/types";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
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

  if (event.type === "account.updated") {
    const account = event.data.object;
    const organisation = organisationByConnectAccount(account.id);
    if (organisation) {
      const snapshot = snapshotFromStripeAccount(account);
      const previous = organisation.payoutEligibility.connectStatus;
      const next = deriveConnectStatus(snapshot);
      if (next !== previous) {
        updateOrganisationConnect(organisation.id, { connectStatus: next });
        await notifyProvider(organisation.id, organisation.name, previous, next, snapshot.currentlyDue);
      }
    }
  }

  return Response.json({ received: true });
}

/** PAY-4: notify the provider on any lifecycle change, with remediation. */
async function notifyProvider(
  organisationId: string,
  organisationName: string,
  previous: ConnectStatus,
  next: ConnectStatus,
  currentlyDue: string[],
): Promise<void> {
  const contact = allProviders().find(
    (p) => p.organisationId === organisationId && p.contactEmail,
  )?.contactEmail;
  if (!contact) return;

  const degraded = next === "restricted" || next === "disabled";
  const subject = degraded
    ? `Action needed: online booking paused for ${organisationName}`
    : `Payout account update for ${organisationName}`;
  const remediation = connectRemediation(next, currentlyDue);

  await sendEmail({
    to: contact,
    subject,
    text:
      `Your Stripe payout account status changed: ${previous} → ${next}.\n\n` +
      (degraded
        ? "New online bookings are paused. Bookings already confirmed are honoured and will be paid out.\n\n"
        : "") +
      (remediation ? `${remediation}\n\n` : "") +
      "Manage payouts: /dashboard/payouts",
  });
}
