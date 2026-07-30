/** INT-10 — privacy-minimising travel-insurance referral for bookable retreats only. */

import { createHmac } from "node:crypto";
import { evaluateListing, type BuyerContext } from "./transactability";
import type { Listing, Organisation } from "./types";

export function travelInsuranceReferral(input: {
  listing: Listing;
  organisation: Organisation;
  buyer: BuyerContext;
  bookingReference?: string;
}): string | null {
  const base = process.env.TRAVEL_INSURANCE_REFERRAL_URL;
  if (!base || input.listing.type !== "retreat") return null;
  const state = evaluateListing(
    {
      supplyType: input.listing.supplyType,
      performanceCountry: input.listing.performanceCountry,
      organisationEligibility: input.organisation.payoutEligibility,
    },
    input.buyer,
  ).state;
  if (state !== "bookable") return null;

  const url = new URL(base);
  url.searchParams.set("utm_source", "the_yoga_universe");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("listing", input.listing.id);
  if (input.bookingReference) {
    // Partner receives a pseudonymous, scoped reference — never buyer contact data.
    const key = process.env.TRAVEL_INSURANCE_SIGNING_SECRET ?? "local-insurance-secret";
    const ref = createHmac("sha256", key)
      .update(`${input.listing.id}:${input.bookingReference}`)
      .digest("base64url")
      .slice(0, 24);
    url.searchParams.set("ref", ref);
  }
  return url.toString();
}
