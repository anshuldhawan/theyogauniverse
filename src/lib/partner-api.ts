/** INT-8 — API-key verification shared by versioned partner endpoints. */

import { createHash, timingSafeEqual } from "node:crypto";

function fingerprints(): Buffer[] {
  return (process.env.PARTNER_API_KEYS_SHA256 ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => /^[a-f0-9]{64}$/.test(value))
    .map((value) => Buffer.from(value, "hex"));
}

export function validPartnerApiKey(supplied: string | null): boolean {
  if (!supplied) return false;
  // Explicit local key permits deterministic tests/dev but is never enabled in production.
  if (process.env.NODE_ENV !== "production" && supplied === (process.env.DEV_PARTNER_API_KEY ?? "dev-partner-key")) {
    return true;
  }
  const actual = createHash("sha256").update(supplied).digest();
  return fingerprints().some(
    (expected) => expected.length === actual.length && timingSafeEqual(expected, actual),
  );
}
