/**
 * BKG commercial mechanics, as pure domain logic:
 * waitlists (BKG-4), cancellation/refund policies (BKG-6),
 * deposit + balance (BKG-8), instalment plans (BKG-9),
 * class packs (BKG-11), promo codes (BKG-14), gift cards (BKG-13).
 * All money is integer minor units (DM-4).
 */

import { money, type Money } from "./money";

/* ------------------------------ BKG-4 waitlist ----------------------------- */

export interface WaitlistEntry {
  email: string;
  joinedAt: Date;
}

export interface Waitlist {
  entries: WaitlistEntry[];
  maxSize: number;
  /** Hours the promoted person has to respond before the spot moves on. */
  responseWindowHours: number;
}

export function joinWaitlist(list: Waitlist, email: string, now: Date): Waitlist | null {
  if (list.entries.length >= list.maxSize) return null;
  if (list.entries.some((e) => e.email === email)) return list;
  return { ...list, entries: [...list.entries, { email, joinedAt: now }] };
}

export function waitlistPosition(list: Waitlist, email: string): number | null {
  const index = list.entries.findIndex((e) => e.email === email);
  return index === -1 ? null : index + 1;
}

/** Automatic promotion on cancellation: first in line gets the spot. */
export function promoteFromWaitlist(list: Waitlist): {
  promoted: WaitlistEntry | null;
  remaining: Waitlist;
} {
  const [promoted, ...rest] = list.entries;
  return { promoted: promoted ?? null, remaining: { ...list, entries: rest } };
}

/* ----------------------- BKG-6 cancellation policies ----------------------- */

export interface RefundLadderStep {
  /** Refund applies when cancelling at least this many hours before start. */
  minHoursBefore: number;
  refundBps: number; // 10000 = full refund
}

export interface CancellationPolicy {
  /** Descending ladder, e.g. [{48h: 100%}, {12h: 50%}, {0h: 0%}]. */
  ladder: RefundLadderStep[];
  creditInsteadOfRefund: boolean;
}

export function refundFor(
  policy: CancellationPolicy,
  paid: Money,
  hoursBeforeStart: number,
): { amount: Money; asCredit: boolean } {
  const step = [...policy.ladder]
    .sort((a, b) => b.minHoursBefore - a.minHoursBefore)
    .find((s) => hoursBeforeStart >= s.minHoursBefore);
  const bps = step?.refundBps ?? 0;
  return {
    amount: money(Math.round((paid.amount * bps) / 10_000), paid.currency),
    asCredit: policy.creditInsteadOfRefund && bps > 0,
  };
}

/* -------------------- BKG-8/9 deposits and instalments --------------------- */

export interface PaymentScheduleItem {
  dueAt: Date;
  amount: Money;
  label: string;
}

/** Deposit at booking, balance due N days before the start date. */
export function depositSchedule(
  total: Money,
  depositBps: number,
  bookedAt: Date,
  startsAt: Date,
  balanceDueDaysBefore: number,
): PaymentScheduleItem[] {
  const deposit = Math.round((total.amount * depositBps) / 10_000);
  const balanceDue = new Date(startsAt.getTime() - balanceDueDaysBefore * 86_400_000);
  return [
    { dueAt: bookedAt, amount: money(deposit, total.currency), label: "Deposit" },
    {
      // Balance can never be due before booking (late bookings pay in full-ish immediately).
      dueAt: balanceDue > bookedAt ? balanceDue : bookedAt,
      amount: money(total.amount - deposit, total.currency),
      label: "Balance",
    },
  ];
}

/**
 * Equal monthly instalments; remainder cents land on the first payment so the
 * schedule always sums exactly to the total (DM-4: never lose a cent).
 */
export function instalmentSchedule(
  total: Money,
  count: 3 | 6 | 12,
  firstChargeAt: Date,
): PaymentScheduleItem[] {
  const base = Math.floor(total.amount / count);
  const remainder = total.amount - base * count;
  return Array.from({ length: count }, (_, i) => ({
    dueAt: new Date(
      Date.UTC(
        firstChargeAt.getUTCFullYear(),
        firstChargeAt.getUTCMonth() + i,
        firstChargeAt.getUTCDate(),
      ),
    ),
    amount: money(i === 0 ? base + remainder : base, total.currency),
    label: `Instalment ${i + 1} of ${count}`,
  }));
}

/* --------------------------- BKG-11 class packs ---------------------------- */

export interface ClassPack {
  creditsTotal: number;
  creditsUsed: number;
  expiresAt: Date;
  transferable: boolean;
}

export function redeemCredit(pack: ClassPack, now: Date): ClassPack | null {
  if (now > pack.expiresAt) return null;
  if (pack.creditsUsed >= pack.creditsTotal) return null;
  return { ...pack, creditsUsed: pack.creditsUsed + 1 };
}

/* --------------------------- BKG-14 promo codes ---------------------------- */

export interface PromoCode {
  code: string;
  kind: "percent" | "fixed";
  /** bps for percent, minor units for fixed. */
  value: number;
  currency?: string;
  usesRemaining: number;
  validFrom: Date;
  validUntil: Date;
  stackable: boolean;
}

export function applyPromo(
  price: Money,
  promo: PromoCode,
  now: Date,
): { price: Money; discount: Money } | { error: string } {
  if (now < promo.validFrom || now > promo.validUntil) return { error: "This code has expired." };
  if (promo.usesRemaining <= 0) return { error: "This code has reached its usage limit." };
  if (promo.kind === "fixed" && promo.currency !== price.currency) {
    return { error: "This code doesn't apply to this currency." };
  }
  const discountAmount =
    promo.kind === "percent"
      ? Math.round((price.amount * promo.value) / 10_000)
      : Math.min(promo.value, price.amount);
  return {
    price: money(price.amount - discountAmount, price.currency),
    discount: money(discountAmount, price.currency),
  };
}

/* --------------------------- BKG-13 gift cards ----------------------------- */

export interface GiftCard {
  code: string;
  balance: Money;
}

export function redeemGiftCard(
  card: GiftCard,
  charge: Money,
): { card: GiftCard; covered: Money; remainderDue: Money } {
  if (card.balance.currency !== charge.currency) {
    return { card, covered: money(0, charge.currency), remainderDue: charge };
  }
  const covered = Math.min(card.balance.amount, charge.amount);
  return {
    card: { ...card, balance: money(card.balance.amount - covered, card.balance.currency) },
    covered: money(covered, charge.currency),
    remainderDue: money(charge.amount - covered, charge.currency),
  };
}

/* ---------------------- BKG-16 calendar (.ics) export ---------------------- */

export function bookingIcs(params: {
  uid: string;
  title: string;
  location: string;
  startsAtUtc: Date;
  endsAtUtc: Date;
  description: string;
}): string {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Yoga Universe//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${params.uid}@theyogauniverse`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(params.startsAtUtc)}`,
    `DTEND:${stamp(params.endsAtUtc)}`,
    `SUMMARY:${escape(params.title)}`,
    `LOCATION:${escape(params.location)}`,
    `DESCRIPTION:${escape(params.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
