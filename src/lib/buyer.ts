import { headers } from "next/headers";
import type { BuyerContext } from "./transactability";

/**
 * Resolve the viewing buyer's context per request (DM-7: the buyer-region
 * component of transactability is request-scoped and never cached).
 *
 * On Vercel the country arrives via the `x-vercel-ip-country` geo header.
 * At checkout this is corroborated with billing address and card issuer
 * country (PAY-11 evidence collection); for rendering Book vs Enquire the
 * geo header is the first signal. Locally, DEV_BUYER_COUNTRY overrides
 * (default US so the transactional path is exercised in dev).
 */
export async function buyerContext(): Promise<BuyerContext> {
  const h = await headers();
  const geo = h.get("x-vercel-ip-country");
  if (geo) return { country: geo.toUpperCase() };
  if (process.env.NODE_ENV !== "production") {
    return { country: process.env.DEV_BUYER_COUNTRY ?? "US" };
  }
  return { country: null };
}
