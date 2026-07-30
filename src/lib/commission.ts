/**
 * PAY-5 — commission resolved from the listing type at time of purchase and
 * stored immutably on the transaction. Two bands:
 *   12% high-ticket:    retreats, trainings (incl. CE, immersions)
 *   5%  high-frequency: classes, workshops, courses, privates, online,
 *                       on-demand, packs, memberships
 *
 * PAY-8 — escrow: high-ticket funds are held and released at event start;
 * high-frequency settles on the normal rolling basis.
 */

import { COMMISSION_BPS } from "./config/markets";
import { percentageBps, type Money } from "./money";
import type { ListingType } from "./types";

const HIGH_TICKET: ReadonlySet<ListingType> = new Set(["retreat", "teacher_training"]);

export function commissionBpsFor(type: ListingType): number {
  return HIGH_TICKET.has(type) ? COMMISSION_BPS.highTicket : COMMISSION_BPS.highFrequency;
}

export function commissionFor(type: ListingType, price: Money): Money {
  return percentageBps(price, commissionBpsFor(type));
}

/** PAY-8: escrow release moment — event start for high-ticket, immediate otherwise. */
export function escrowReleaseAt(type: ListingType, eventStartUtc: Date): Date | null {
  return HIGH_TICKET.has(type) ? eventStartUtc : null;
}
