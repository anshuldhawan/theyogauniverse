export type CredentialTier = "self_declared" | "document_verified" | "registry_verified";
export type CredentialStatus =
  | "self_declared"
  | "pending_review"
  | "verified"
  | "lapsed"
  | "rejected";

export const CREDENTIAL_FAMILIES = [
  "yoga_alliance",
  "yoga_alliance_professionals",
  "british_wheel_of_yoga",
  "yoga_australia",
  "iyengar",
  "ashtanga_authorisation",
  "sivananda",
  "bihar_school",
  "meditation_lineage",
  "wim_hof",
  "holotropic",
  "oxygen_advantage",
  "somatic_therapy",
  "first_aid",
  "safeguarding_dbs",
] as const;

export interface CredentialRecord {
  id: string;
  kind: "registry" | "document" | "insurance" | "lineage" | "safeguarding";
  status: CredentialStatus;
  expiresAt: Date | null;
  lastCheckedAt: Date | null;
  documentRef: string | null;
}

export interface CredentialNotification {
  credentialId: string;
  kind: "expiry_warning" | "downgraded";
}

export interface ManualVerificationItem {
  id: string;
  submittedAt: Date;
  priority: "normal" | "urgent";
}

export function publicCredentialView(record: CredentialRecord) {
  return {
    id: record.id,
    tier: tierForCredential(record),
    status: record.status,
  };
}

export function tierForCredential(record: CredentialRecord): CredentialTier {
  if (record.status !== "verified") return "self_declared";
  return record.kind === "registry" ? "registry_verified" : "document_verified";
}

/**
 * CRD-2/5 lifecycle: warn 30 days ahead and automatically remove the verified
 * tier at expiry. Calling this function is idempotent.
 */
export function evaluateCredential(
  record: CredentialRecord,
  now: Date,
): { credential: CredentialRecord; notifications: CredentialNotification[] } {
  if (!record.expiresAt || record.status !== "verified") {
    return { credential: record, notifications: [] };
  }
  const daysRemaining = (record.expiresAt.getTime() - now.getTime()) / 86_400_000;
  if (daysRemaining <= 0) {
    return {
      credential: { ...record, status: "lapsed", lastCheckedAt: now },
      notifications: [{ credentialId: record.id, kind: "downgraded" }],
    };
  }
  if (daysRemaining <= 30) {
    return {
      credential: { ...record, lastCheckedAt: now },
      notifications: [{ credentialId: record.id, kind: "expiry_warning" }],
    };
  }
  return { credential: { ...record, lastCheckedAt: now }, notifications: [] };
}

/** Registry records checked least recently are processed first. */
export function registryRecheckQueue(
  credentials: CredentialRecord[],
  now: Date,
  cadenceDays = 30,
): CredentialRecord[] {
  const cutoff = now.getTime() - cadenceDays * 86_400_000;
  return credentials
    .filter(
      (record) =>
        record.kind === "registry" &&
        record.status === "verified" &&
        (!record.lastCheckedAt || record.lastCheckedAt.getTime() <= cutoff),
    )
    .sort(
      (a, b) =>
        (a.lastCheckedAt?.getTime() ?? 0) - (b.lastCheckedAt?.getTime() ?? 0),
    );
}

export function manualQueue(
  items: ManualVerificationItem[],
  now: Date,
): Array<ManualVerificationItem & { dueAt: Date; overdue: boolean }> {
  return [...items]
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority === "urgent" ? -1 : 1;
      return a.submittedAt.getTime() - b.submittedAt.getTime();
    })
    .map((item) => {
      const dueAt = addBusinessDays(item.submittedAt, 2);
      return { ...item, dueAt, overdue: now > dueAt };
    });
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let remaining = days;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    const day = result.getUTCDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return result;
}
