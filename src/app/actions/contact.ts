"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { track } from "@/lib/analytics";
import { evaluateSanctions } from "@/lib/compliance";
import { recordSanctionsDecision } from "@/lib/compliance-workflows";
import { BLOCKED_JURISDICTIONS } from "@/lib/config/markets";
import { sendEmail } from "@/lib/email";
import { checkContactRateLimit } from "@/lib/ratelimit";
import { providerBySlug, recordOutboundContact } from "@/lib/repo";
import { db, hasDatabase, schema } from "@/db";

/**
 * BKG-20 — direct-contact flow for advertising-only listings, constrained by
 * PAY-17a. This is a contact FORM, not a managed thread:
 *  - the message is forwarded to the provider's own email and not retained;
 *  - we record only THAT an outbound contact occurred (DASH-7/ANL-2);
 *  - no acknowledgement implying we handle the request, no SLA, no
 *    structured booking fields — dates/party size go in free text only;
 *  - nothing is held, reserved or confirmed (WVR-8: no waiver either).
 * Do not "improve" this into a managed enquiry pipeline — that re-opens
 * DAC7/UK/SERR (PAY-12); route such proposals to Legal.
 */

const contactSchema = z.object({
  providerSlug: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(4000),
});

export interface ContactFormState {
  status: "idle" | "sent" | "error";
  error?: string;
}

export async function sendContactMessage(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    providerSlug: formData.get("providerSlug"),
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { status: "error", error: "Please check your name, email and message." };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const country = requestHeaders.get("x-vercel-ip-country")?.toUpperCase();

  const sanctions = evaluateSanctions({
    country: country ?? null,
    blockedJurisdictions: BLOCKED_JURISDICTIONS,
    listVersion: "jurisdictions-2026-07-29",
  });
  const sanctionsRow = recordSanctionsDecision(
    "contact",
    `${parsed.data.providerSlug}:${ip}`,
    sanctions,
  );
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
    return { status: "error", error: "This service is not available in your region." };
  }

  // TSF-9: rate-limit per IP; log-and-limit, never silently drop.
  const { allowed } = await checkContactRateLimit(`contact:${ip}`);
  if (!allowed) {
    return {
      status: "error",
      error: "Too many messages in the last hour. Please try again later.",
    };
  }

  const provider = providerBySlug(parsed.data.providerSlug);
  if (!provider || !provider.contactEmail) {
    return { status: "error", error: "This provider cannot be contacted right now." };
  }

  await sendEmail({
    to: provider.contactEmail,
    replyTo: parsed.data.email,
    subject: `Message via The Yoga Universe from ${parsed.data.name}`,
    text:
      `${parsed.data.message}\n\n—\nFrom: ${parsed.data.name} <${parsed.data.email}>\n` +
      "Forwarded by The Yoga Universe. Reply directly to the sender; The Yoga Universe is not part of this conversation.",
  });

  // The only records PAY-17a permits: a counter, and an impression-style event.
  recordOutboundContact(provider.id);
  track({
    name: "outbound_contact",
    subjectTransactability: "enquiry_only",
    payload: { providerId: provider.id },
  });

  return { status: "sent" };
}
