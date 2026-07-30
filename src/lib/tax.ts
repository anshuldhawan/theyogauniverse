/**
 * PAY-10/PAY-11 — indirect tax handling.
 *
 * Track A (in-person): place of supply is where the class/retreat physically
 * happens. v1: US marketplace-facilitator registrations; Stripe Tax computes
 * the rate from the venue address at checkout.
 *
 * Track B (online): place of supply is the buyer's location. Requires
 * location evidence collected and stored with the transaction, and is
 * gated per region by PAY-11a (config). Where evidence is missing or
 * contradictory: block, don't guess — the transactability engine has
 * already prevented checkout for buyers we can't place.
 *
 * Demo/dev computes 0% tax (Stripe Tax owns real rates in production);
 * the evidence and gating logic is the part that must be correct here.
 */

import { trackBEnabledForBuyer } from "./config/markets";
import { money, type Money } from "./money";
import { taxTrackOf } from "./transactability";
import type { SupplyType } from "./types";

export interface LocationEvidence {
  /** ISO alpha-2 signals, each nullable. */
  geoIpCountry: string | null;
  billingCountry: string | null;
  cardIssuerCountry: string | null;
}

export interface TaxResolution {
  ok: boolean;
  track: "A" | "B";
  /** Country whose treatment applies (performance country or buyer country). */
  taxCountry: string | null;
  taxAmount: Money;
  evidence: LocationEvidence | null;
  blockReason?: string;
}

/**
 * PAY-11: two non-contradictory pieces of evidence determine the buyer
 * country. Contradiction or absence blocks the transaction.
 */
export function resolveBuyerCountry(evidence: LocationEvidence): string | null {
  const signals = [evidence.geoIpCountry, evidence.billingCountry, evidence.cardIssuerCountry]
    .filter((c): c is string => Boolean(c))
    .map((c) => c.toUpperCase());
  if (signals.length < 2) return null;
  const counts = new Map<string, number>();
  for (const signal of signals) counts.set(signal, (counts.get(signal) ?? 0) + 1);
  const [top, topCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return topCount >= 2 ? top : null;
}

export function resolveTax(params: {
  supplyType: SupplyType;
  performanceCountry: string | null;
  gross: Money;
  evidence: LocationEvidence;
}): TaxResolution {
  const track = taxTrackOf(params.supplyType);
  const zero = money(0, params.gross.currency);

  if (track === "A") {
    if (params.performanceCountry?.toUpperCase() !== "US") {
      return {
        ok: false,
        track,
        taxCountry: params.performanceCountry,
        taxAmount: zero,
        evidence: null,
        blockReason: "No live Track A treatment for this performance country (PAY-10).",
      };
    }
    // Stripe Tax computes the actual state/local rate at checkout; the
    // platform collects and remits as marketplace facilitator.
    return { ok: true, track, taxCountry: "US", taxAmount: zero, evidence: null };
  }

  const buyerCountry = resolveBuyerCountry(params.evidence);
  if (!buyerCountry) {
    return {
      ok: false,
      track,
      taxCountry: null,
      taxAmount: zero,
      evidence: params.evidence,
      blockReason:
        "Buyer location evidence missing or contradictory — blocked, not guessed (PAY-11).",
    };
  }
  if (!trackBEnabledForBuyer(buyerCountry)) {
    return {
      ok: false,
      track,
      taxCountry: buyerCountry,
      taxAmount: zero,
      evidence: params.evidence,
      blockReason: `Track B is not enabled for buyer region of ${buyerCountry} (PAY-11a).`,
    };
  }
  return { ok: true, track, taxCountry: buyerCountry, taxAmount: zero, evidence: params.evidence };
}
