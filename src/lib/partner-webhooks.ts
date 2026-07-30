/** INT-8 — signed, retryable outbound booking lifecycle webhooks. */

import { createHmac, randomUUID } from "node:crypto";
import type { Booking, BookingState } from "./types";

export interface BookingWebhookEvent {
  id: string;
  type: `booking.${BookingState}`;
  apiVersion: "2026-07-01";
  createdAt: string;
  data: {
    bookingId: string;
    reference: string;
    listingId: string;
    providerId: string;
    state: BookingState;
  };
}

interface Delivery {
  event: BookingWebhookEvent;
  attempts: number;
  nextAttemptAt: number;
}

const globalQueue = globalThis as unknown as { __partnerWebhookQueue?: Delivery[] };
function queue(): Delivery[] {
  globalQueue.__partnerWebhookQueue ??= [];
  return globalQueue.__partnerWebhookQueue;
}

export function enqueueBookingWebhook(booking: Booking): BookingWebhookEvent {
  const event: BookingWebhookEvent = {
    id: randomUUID(),
    type: `booking.${booking.state}`,
    apiVersion: "2026-07-01",
    createdAt: new Date().toISOString(),
    data: {
      bookingId: booking.id,
      reference: booking.reference,
      listingId: booking.listingId,
      providerId: booking.providerId,
      state: booking.state,
    },
  };
  queue().push({ event, attempts: 0, nextAttemptAt: Date.now() });
  return event;
}

export function pendingBookingWebhooks(): readonly Delivery[] {
  return queue();
}

export function webhookSignature(payload: string, timestamp: number, secret: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
}

export async function deliverBookingWebhooks(options: {
  endpoint?: string;
  secret?: string;
  fetch?: typeof fetch;
  now?: number;
} = {}): Promise<{ delivered: number; failed: number }> {
  const endpoint = options.endpoint ?? process.env.PARTNER_WEBHOOK_URL;
  const secret = options.secret ?? process.env.PARTNER_WEBHOOK_SECRET;
  if (!endpoint || !secret) return { delivered: 0, failed: 0 };
  const now = options.now ?? Date.now();
  const fetcher = options.fetch ?? fetch;
  let delivered = 0;
  let failed = 0;
  for (const item of [...queue()]) {
    if (item.nextAttemptAt > now) continue;
    const payload = JSON.stringify(item.event);
    const timestamp = Math.floor(now / 1000);
    try {
      const response = await fetcher(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Yoga-Webhook-Id": item.event.id,
          "X-Yoga-Webhook-Timestamp": String(timestamp),
          "X-Yoga-Webhook-Signature": `v1=${webhookSignature(payload, timestamp, secret)}`,
        },
        body: payload,
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      queue().splice(queue().indexOf(item), 1);
      delivered += 1;
    } catch {
      item.attempts += 1;
      item.nextAttemptAt = now + Math.min(3_600_000, 2 ** item.attempts * 1_000);
      failed += 1;
    }
  }
  return { delivered, failed };
}
