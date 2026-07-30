/**
 * DM-7 / §4.3 — the transactability rule. Derived, never hand-set.
 *
 * Transactability requires BOTH:
 *  1. Payability — the owning Organisation can receive money: US-domiciled
 *     with an active US Stripe Connect account (PAY-2). No override exists.
 *  2. Tax tractability — a live, registered indirect-tax treatment exists
 *     for this supply:
 *       Track A (in-person): place of supply = where physically performed
 *         (PAY-10). Live treatment in v1: US only.
 *       Track B (online_live / on_demand): place of supply = buyer location
 *         (PAY-11). Governed by the per-region flag (PAY-11a); US-only in v1.
 *
 * Because of Track B, transactability for online/on-demand listings is
 * REQUEST-SCOPED (depends on the viewing buyer), never a cacheable column.
 * `evaluateListing` therefore takes the buyer context; callers must resolve
 * it at render time. A listing must never present a Book button it cannot
 * honour.
 */

import {
  PAYOUT_ELIGIBLE_COUNTRIES,
  trackBEnabledForBuyer,
} from "./config/markets";
import type { PayoutEligibility, SupplyType, TaxTrack, Transactability } from "./types";

export interface BuyerContext {
  /** ISO-3166 alpha-2, or null when unknown. Unknown buyers never see Track B Book buttons (PAY-11: do not guess). */
  country: string | null;
}

export function taxTrackOf(supplyType: SupplyType): TaxTrack {
  return supplyType === "in_person" ? "A" : "B";
}

/** Condition 1 — payability (PAY-2 hard gate; PAY-4 status transitions). */
export function isPayable(eligibility: PayoutEligibility): boolean {
  return (
    PAYOUT_ELIGIBLE_COUNTRIES.has(eligibility.domicileCountry.toUpperCase()) &&
    eligibility.connectStatus === "active"
  );
}

/**
 * Condition 2 — tax tractability. "A treatment exists and is switched on",
 * NOT "the place of supply is the US" — they collapse to the same answer in
 * v1 but are modelled separately (§4.3 note).
 */
export function isTaxTractable(
  supplyType: SupplyType,
  performanceCountry: string | null,
  buyer: BuyerContext,
): boolean {
  if (taxTrackOf(supplyType) === "A") {
    // Track A: live treatments keyed by performance country. v1: US
    // marketplace facilitator programme only (PAY-10). The US-provider /
    // non-US-venue edge case fails here, not at payability.
    return performanceCountry?.toUpperCase() === "US";
  }
  // Track B: keyed by buyer region flag (PAY-11a).
  return trackBEnabledForBuyer(buyer.country);
}

export interface ListingTransactabilityInput {
  supplyType: SupplyType;
  performanceCountry: string | null;
  organisationEligibility: PayoutEligibility;
}

export interface TransactabilityResult {
  state: Transactability;
  payable: boolean;
  taxTractable: boolean;
  taxTrack: TaxTrack;
  /**
   * True when the result depends on the viewing buyer (Track B): the
   * organisation-level components may be cached, the buyer component may not.
   */
  requestScoped: boolean;
}

export function evaluateListing(
  listing: ListingTransactabilityInput,
  buyer: BuyerContext,
): TransactabilityResult {
  const payable = isPayable(listing.organisationEligibility);
  const taxTrack = taxTrackOf(listing.supplyType);
  const taxTractable = isTaxTractable(listing.supplyType, listing.performanceCountry, buyer);
  return {
    state: payable && taxTractable ? "bookable" : "enquiry_only",
    payable,
    taxTractable,
    taxTrack,
    requestScoped: taxTrack === "B",
  };
}
