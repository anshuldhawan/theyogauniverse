/** INT-9 — signed affiliate attribution, structurally limited to bookable inventory. */

import { createHmac, timingSafeEqual } from "node:crypto";
import { evaluateListing, type BuyerContext } from "./transactability";
import type { Listing, Organisation } from "./types";

export const AFFILIATE_COOKIE = "tyu_affiliate";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export interface AffiliateAttribution {
  partner: string;
  listingId: string;
  clickedAt: number;
  expiresAt: number;
}

function secret(): string {
  return process.env.AFFILIATE_SIGNING_SECRET ?? "local-affiliate-secret-not-for-production";
}

function signature(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function allowedPartners(): Set<string> {
  return new Set(
    (process.env.AFFILIATE_PARTNERS ?? "demo")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export function createAffiliateAttribution(input: {
  partner: string;
  listing: Listing;
  organisation: Organisation;
  buyer: BuyerContext;
  now?: number;
}): string | null {
  if (!allowedPartners().has(input.partner)) return null;
  const transactability = evaluateListing(
    {
      supplyType: input.listing.supplyType,
      performanceCountry: input.listing.performanceCountry,
      organisationEligibility: input.organisation.payoutEligibility,
    },
    input.buyer,
  );
  // PAY-17a: enforcement happens before an attribution record or cookie exists.
  if (transactability.state !== "bookable") return null;
  const clickedAt = input.now ?? Date.now();
  const attribution: AffiliateAttribution = {
    partner: input.partner,
    listingId: input.listing.id,
    clickedAt,
    expiresAt: clickedAt + MAX_AGE_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(attribution)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function readAffiliateAttribution(token: string, now = Date.now()): AffiliateAttribution | null {
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied) return null;
  const expected = signature(payload);
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AffiliateAttribution;
    if (
      !parsed.partner ||
      !parsed.listingId ||
      !Number.isFinite(parsed.clickedAt) ||
      !Number.isFinite(parsed.expiresAt) ||
      parsed.expiresAt <= now
    ) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function affiliateCookie(token: string): string {
  return `${AFFILIATE_COOKIE}=${token}; Max-Age=${MAX_AGE_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}
