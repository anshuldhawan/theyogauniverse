import { z } from "zod";
import type { OrgRole } from "./auth";

export const practitionerProfileSchema = z.object({
  preferredStyles: z.array(z.string().min(1)).default([]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).nullable(),
  injuriesCiphertext: z.string().min(1).nullable(),
  preferredLanguages: z.array(z.string().min(2)).default([]),
  homeCity: z.string().min(1).nullable(),
  timezone: z.string().refine(isIanaTimezone, "Must be an IANA timezone").nullable(),
  billingCountry: z.string().regex(/^[A-Z]{2}$/),
});

export type PractitionerProfile = z.infer<typeof practitionerProfileSchema>;
export type VerifiedAction = "post_review" | "claim_profile";
export type IdentityVerification = "not_started" | "traceability_verified" | "kyc_verified";

export interface IdentityAccount {
  id: string;
  verifiedEmail: string | null;
  providerIds: string[];
  createdAt: Date;
}

export interface Follow {
  subjectType: "teacher" | "studio" | "city";
  subjectId: string;
}

export interface SavedCollection {
  id: string;
  name: string;
  publicToken: string | null;
  listingIds: string[];
}

export function canPerformVerifiedAction(
  emailVerifiedAt: Date | null,
  _action: VerifiedAction,
): boolean {
  return emailVerifiedAt !== null;
}

/** ACC-7: owners/admins must use 2FA; other roles may opt in. */
export function sessionMeetsRolePolicy(role: OrgRole, hasSecondFactor: boolean): boolean {
  return role !== "owner" && role !== "admin" ? true : hasSecondFactor;
}

/** ACC-5: verification gates payout, never profile creation or listing. */
export function identityCapability(
  domicileCountry: string,
  verification: IdentityVerification,
): { mayList: true; mayReceivePayout: boolean; traceabilitySatisfied: boolean } {
  const usDomiciled = domicileCountry.toUpperCase() === "US";
  return {
    mayList: true,
    mayReceivePayout: usDomiciled && verification === "kyc_verified",
    traceabilitySatisfied:
      verification === "traceability_verified" || verification === "kyc_verified",
  };
}

/**
 * ACC-6: merge identities only when both providers attest the same verified
 * email. The oldest account survives and all provider identities are retained.
 */
export function mergeAccounts(a: IdentityAccount, b: IdentityAccount): IdentityAccount {
  const emailA = normalizeEmail(a.verifiedEmail);
  const emailB = normalizeEmail(b.verifiedEmail);
  if (!emailA || emailA !== emailB) {
    throw new Error("Accounts must share the same verified email");
  }
  const [survivor, merged] = a.createdAt <= b.createdAt ? [a, b] : [b, a];
  return {
    ...survivor,
    verifiedEmail: emailA,
    providerIds: [...new Set([...survivor.providerIds, ...merged.providerIds])],
  };
}

export function addFollow(follows: Follow[], follow: Follow): Follow[] {
  const exists = follows.some(
    (item) => item.subjectType === follow.subjectType && item.subjectId === follow.subjectId,
  );
  return exists ? follows : [...follows, follow];
}

export function saveListing(collection: SavedCollection, listingId: string): SavedCollection {
  return collection.listingIds.includes(listingId)
    ? collection
    : { ...collection, listingIds: [...collection.listingIds, listingId] };
}

export function publicCollectionPath(collection: SavedCollection): string | null {
  return collection.publicToken ? `/saved/${collection.publicToken}` : null;
}

/** ACC-8: stable export envelope; secrets and encrypted health data are excluded. */
export function buildAccountExport(input: {
  generatedAt: Date;
  profile: PractitionerProfile;
  follows: Follow[];
  collections: SavedCollection[];
}) {
  const { injuriesCiphertext: _privateHealthData, ...portableProfile } = input.profile;
  return {
    version: 1,
    generatedAt: input.generatedAt.toISOString(),
    profile: portableProfile,
    follows: input.follows,
    collections: input.collections,
  };
}

export function normalizeEmail(email: string | null): string | null {
  return email?.trim().toLowerCase() || null;
}

function isIanaTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return value.includes("/");
  } catch {
    return false;
  }
}
