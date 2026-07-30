/**
 * ANL-1 — governed event pipeline, with the PAY-17a boundary enforced
 * structurally: for advertising-only listings the ONLY permitted events are
 * impression, profile view and outbound contact click. The funnel ends at
 * outbound_contact and cannot be extended past it — there is deliberately no
 * event name for anything downstream, and attempts to log one against an
 * advertising-only subject throw in development.
 *
 * Production sink: PostHog (via Vercel Marketplace), streamed by
 * captureGovernedEvent. Dev/offline: console sink only (agents.md rule 7).
 */

import { captureGovernedEvent } from "@/lib/posthog-server";

export const ADVERTISING_ONLY_EVENTS = [
  "impression",
  "profile_view",
  "outbound_contact",
] as const;

export const TRANSACTABLE_EVENTS = [
  ...ADVERTISING_ONLY_EVENTS,
  "search",
  "listing_view",
  "booking_started",
  "booking_details_completed",
  "payment_started",
  "booking_confirmed",
  "review_submitted",
  "enquiry_sent",
  "enquiry_answered",
  // BLG-42/43 — blog funnel. The reported KPI is blog-assisted bookings
  // (attribution touch on booking_confirmed), never sessions or pageviews.
  "article_view",
  "article_commercial_click",
] as const;

export type EventName = (typeof TRANSACTABLE_EVENTS)[number];

export interface AnalyticsEvent {
  name: EventName;
  subjectTransactability: "bookable" | "enquiry_only" | null;
  payload: Record<string, string | number | boolean | null>;
}

export function track(event: AnalyticsEvent): void {
  if (
    event.subjectTransactability === "enquiry_only" &&
    !(ADVERTISING_ONLY_EVENTS as readonly string[]).includes(event.name)
  ) {
    const message =
      `PAY-17a violation: event "${event.name}" is not permitted on an advertising-only ` +
      "listing. Impressions, profile views and outbound contact clicks are the only " +
      "allowed metrics. Proposals to close this gap go to Legal (PAY-12), not Analytics.";
    if (process.env.NODE_ENV !== "production") throw new Error(message);
    console.error(message);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${event.name}`, JSON.stringify(event.payload));
  }
  // ANL-1: stream to PostHog. Fire-and-forget — analytics never blocks a
  // user action; no-op without keys and in the browser (posthog-js owns
  // client capture, so browser-originated governed events must keep flowing
  // through the /api/analytics beacon to be recorded server-side).
  void captureGovernedEvent(event.name, {
    subject_transactability: event.subjectTransactability,
    ...event.payload,
  }).catch(() => undefined);
}
