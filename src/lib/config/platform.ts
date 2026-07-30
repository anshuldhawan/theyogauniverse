/** Machine-readable NFR budgets used by deployment, probes, and tests. */

export const SERVICE_LEVELS = {
  bookingAvailability: 0.999,
  searchAvailability: 0.995,
  searchP95Ms: 400,
  pageTtfbP95Ms: 300,
  bookingConfirmationP95Ms: 2_000,
  recoveryPointMinutes: 15,
  recoveryTimeMinutes: 240,
} as const;

export const LAUNCH_SCALE = {
  providers: 350_000,
  listings: 1_500_000,
  occurrences: 8_000_000,
  monthlyVisitors: 4_000_000,
  headroomMultiplier: 10,
} as const;

export type DataRegion = "us" | "eu" | "au";

const EU_EEA_UK = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU",
  "IE", "IS", "IT", "LI", "LT", "LU", "LV", "MT", "NL", "NO", "PL", "PT", "RO", "SE",
  "SI", "SK", "GB",
]);

/** NFR-4: residency is selected from the data subject, never edge proximity. */
export function dataRegionFor(country: string | null): DataRegion {
  const normalized = country?.toUpperCase() ?? "";
  if (EU_EEA_UK.has(normalized)) return "eu";
  if (normalized === "AU" || normalized === "NZ") return "au";
  return "us";
}

export function assertDataRegion(country: string | null, actual: DataRegion): void {
  const required = dataRegionFor(country);
  if (actual !== required) {
    throw new Error(`Residency violation: ${country ?? "unknown"} data requires ${required}, got ${actual}`);
  }
}
