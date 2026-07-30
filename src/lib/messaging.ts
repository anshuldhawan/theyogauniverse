/**
 * MSG — messaging rules.
 *
 * MSG-2: contact masking applies ONLY inside managed threads for
 * transactable listings (protecting the transaction until booking).
 * It never applies to advertising-only listings, whose entire purpose is
 * direct contact (BKG-20) — masking there would sabotage the product.
 *
 * MSG-3: managed enquiries (SLA clocks, response-rate tracking) exist for
 * transactable listings only. Advertising-only contact is a forwarded
 * message with no thread and no tracking (PAY-17a).
 */

import type { Transactability } from "./types";

export function maskingApplies(transactability: Transactability): boolean {
  return transactability === "bookable";
}

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.]+/g;
const PHONE_PATTERN = /(\+?\d[\d\s().-]{7,}\d)/g;
const URL_PATTERN = /(https?:\/\/|www\.)[^\s]+/gi;

/**
 * Mask direct-contact details in a managed thread message. Used pre-booking
 * in transactable threads; never invoked for advertising-only contact.
 */
export function maskContactDetails(text: string, transactability: Transactability): string {
  if (!maskingApplies(transactability)) return text;
  return text
    .replace(EMAIL_PATTERN, "[hidden until booking]")
    .replace(URL_PATTERN, "[hidden until booking]")
    .replace(PHONE_PATTERN, "[hidden until booking]");
}

export interface ManagedEnquiry {
  providerId: string;
  createdAt: Date;
  respondedAt: Date | null;
}

/** MSG-3: response-rate + median-response-time signals feed ranking (SRCH-14). */
export function responseStats(enquiries: ManagedEnquiry[]): {
  responseRate: number;
  medianResponseHours: number | null;
} {
  if (enquiries.length === 0) return { responseRate: 0, medianResponseHours: null };
  const responded = enquiries.filter((e) => e.respondedAt);
  const times = responded
    .map((e) => (e.respondedAt!.getTime() - e.createdAt.getTime()) / 3_600_000)
    .sort((a, b) => a - b);
  const median =
    times.length === 0
      ? null
      : times.length % 2
        ? times[(times.length - 1) / 2]
        : (times[times.length / 2 - 1] + times[times.length / 2]) / 2;
  return { responseRate: responded.length / enquiries.length, medianResponseHours: median };
}

export const NOTIFICATION_CHANNELS = ["email", "web_push", "sms"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
export const MARKETING_TOPICS = ["classes", "retreats", "training", "editorial"] as const;
export type MarketingTopic = (typeof MARKETING_TOPICS)[number];

export interface NotificationPreferences {
  transactional: Record<NotificationChannel, boolean>;
  marketing: Record<NotificationChannel, Partial<Record<MarketingTopic, boolean>>>;
  smsOptInAt: Date | null;
  unsubscribedAt: Date | null;
}

export function defaultNotificationPreferences(): NotificationPreferences {
  return {
    transactional: { email: true, web_push: false, sms: false },
    marketing: { email: {}, web_push: {}, sms: {} },
    smsOptInAt: null,
    unsubscribedAt: null,
  };
}

/** MSG-6: marketing is deny-by-default and independently controlled by channel/topic. */
export function marketingAllowed(
  preferences: NotificationPreferences,
  channel: NotificationChannel,
  topic: MarketingTopic,
): boolean {
  return !preferences.unsubscribedAt && preferences.marketing[channel][topic] === true;
}

/** One-click unsubscribe disables every marketing topic without affecting receipts. */
export function unsubscribeMarketing(
  preferences: NotificationPreferences,
  at: Date,
): NotificationPreferences {
  return {
    ...preferences,
    marketing: { email: {}, web_push: {}, sms: {} },
    unsubscribedAt: at,
  };
}

const preferenceStore = new Map<string, NotificationPreferences>();

export function notificationPreferencesFor(subjectId: string): NotificationPreferences {
  return preferenceStore.get(subjectId) ?? defaultNotificationPreferences();
}

export function saveNotificationPreferences(
  subjectId: string,
  preferences: NotificationPreferences,
): NotificationPreferences {
  const normalised: NotificationPreferences = {
    ...preferences,
    transactional: {
      email: true, // service/legal receipts cannot be disabled globally
      web_push: Boolean(preferences.transactional.web_push),
      sms: Boolean(preferences.transactional.sms && preferences.smsOptInAt),
    },
  };
  preferenceStore.set(subjectId, normalised);
  return normalised;
}

export type TransactionalNotification =
  | "booking_confirmed"
  | "reminder_24h"
  | "reminder_2h"
  | "cancellation"
  | "substitution"
  | "waitlist_promotion"
  | "payment_due"
  | "payment_failed"
  | "balance_due"
  | "escrow_release"
  | "review_request"
  | "refund_issued"
  | "enquiry_received"
  | "enquiry_answered"
  | "message_forwarded";

export function notificationPermitted(input: {
  event: TransactionalNotification;
  transactability: Transactability;
  channel: NotificationChannel;
  preferences: NotificationPreferences;
}): boolean {
  if (input.transactability === "enquiry_only") {
    return input.event === "message_forwarded" && input.channel === "email";
  }
  if (input.channel === "sms" && !input.preferences.smsOptInAt) return false;
  return input.preferences.transactional[input.channel];
}

export interface BroadcastAudienceMember {
  userId: string;
  providerId: string;
  hasCompletedBooking: boolean;
}

/** MSG-7: broadcasts are limited to a transactable provider's own students. */
export function broadcastAudience(
  providerId: string,
  transactability: Transactability,
  audience: BroadcastAudienceMember[],
): BroadcastAudienceMember[] {
  if (transactability !== "bookable") return [];
  return audience.filter((member) => member.providerId === providerId && member.hasCompletedBooking);
}

export function antiCircumventionSignals(
  text: string,
  transactability: Transactability,
): { log: boolean; rateLimit: boolean; hardBlock: false; matches: string[] } {
  if (transactability !== "bookable") {
    return { log: false, rateLimit: false, hardBlock: false, matches: [] };
  }
  const matches = [
    ...(text.match(EMAIL_PATTERN) ?? []),
    ...(text.match(PHONE_PATTERN) ?? []),
    ...(text.match(URL_PATTERN) ?? []),
  ];
  return { log: matches.length > 0, rateLimit: matches.length >= 2, hardBlock: false, matches };
}
