/**
 * Executable v1 scope boundaries (NG-1–NG-8).
 *
 * Keeping these decisions in one data-shaped policy prevents a UI or API from
 * quietly growing a forbidden capability. Future versions may load the same
 * shape from remote configuration.
 */
export const V1_SCOPE = Object.freeze({
  systemOfRecord: "interoperate" as const,
  firstPartyContentProduction: false,
  subscriptionAggregator: false,
  nativeMobileApps: false,
  marketEntryCountries: ["US", "DE", "NL", "FR", "ES", "PT", "IT", "DK", "SE", "CH", "AT", "IE", "CZ", "PL", "GB", "AU"],
  payoutCountries: ["US"],
  discoveryRequiresTransactability: false,
  offPlatformCommerce: Object.freeze({
    fee: false,
    affiliateRevenue: false,
    leadCharge: false,
    outcomeTracking: false,
  }),
});

export type ProductCapability =
  | "studio_back_office"
  | "first_party_content_production"
  | "subscription_aggregator"
  | "native_mobile_app"
  | "off_platform_fee"
  | "off_platform_outcome_tracking";

const FORBIDDEN_V1_CAPABILITIES = new Set<ProductCapability>([
  "studio_back_office",
  "first_party_content_production",
  "subscription_aggregator",
  "native_mobile_app",
  "off_platform_fee",
  "off_platform_outcome_tracking",
]);

export function capabilityEnabled(capability: ProductCapability): boolean {
  return !FORBIDDEN_V1_CAPABILITIES.has(capability);
}

/** PAY-17a/NG-8: retain only that contact happened, never the commercial outcome. */
export function advertisingContactEvent(providerId: string, listingId?: string) {
  return {
    name: "advertising_contact_outbound" as const,
    providerId,
    ...(listingId ? { listingId } : {}),
  };
}

export function isV1PayoutCountry(country: string): boolean {
  return V1_SCOPE.payoutCountries.includes(country.toUpperCase());
}
