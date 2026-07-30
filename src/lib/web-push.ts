/** INT-6 / WEB-5 — VAPID web push with transactional-email fallback. */

import webpush, { type PushSubscription } from "web-push";
import { sendEmail } from "./email";

const globalSubscriptions = globalThis as unknown as {
  __bookingPushSubscriptions?: Map<string, PushSubscription[]>;
};

function subscriptions(): Map<string, PushSubscription[]> {
  globalSubscriptions.__bookingPushSubscriptions ??= new Map();
  return globalSubscriptions.__bookingPushSubscriptions;
}

export function registerPushSubscription(reference: string, subscription: PushSubscription): void {
  const existing = subscriptions().get(reference) ?? [];
  const unique = existing.filter((item) => item.endpoint !== subscription.endpoint);
  subscriptions().set(reference, [...unique, subscription]);
}

export async function notifyBookingUpdate(input: {
  reference: string;
  email: string;
  title: string;
  body: string;
  url: string;
}): Promise<"push" | "email"> {
  const subject = process.env.WEB_PUSH_VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
  const targets = subscriptions().get(input.reference) ?? [];
  if (subject && publicKey && privateKey && targets.length > 0) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    const payload = JSON.stringify({
      title: input.title,
      body: input.body,
      url: input.url,
      tag: `booking-${input.reference}`,
    });
    const results = await Promise.allSettled(
      targets.map((subscription) => webpush.sendNotification(subscription, payload)),
    );
    if (results.some((result) => result.status === "fulfilled")) return "push";
  }
  await sendEmail({ to: input.email, subject: input.title, text: `${input.body}\n\n${input.url}` });
  return "email";
}
