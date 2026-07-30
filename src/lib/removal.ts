/**
 * ING-7 / Decision #7 — listing removal requests.
 *
 * The index publishes professional profiles of people we have no commercial
 * relationship with (approved for launch under Decision #7: an advertising-
 * only listing sends referral traffic to the listed professional). The
 * control that makes this defensible is a removal guarantee that is easy on
 * both sides:
 *
 *  - anyone can request removal from /legal/removal without an account;
 *  - a request whose email matches the listing's own contact address is
 *    honoured immediately (verified ownership);
 *  - every other request lands in /admin/moderation where one click honours
 *    it — suppression from all public reads plus a permanent tombstone so
 *    re-ingestion never restores the listing (ING-7);
 *  - requests older than REMOVAL_SLA_HOURS are flagged overdue in the queue.
 */

import { recordOptOut } from "./ingestion";
import { fileReport, openReports, resolveReport, type Report } from "./moderation";
import {
  allProviders,
  providerById,
  providerBySlug,
  suppressProvider,
} from "./repo";
import type { Provider } from "./types";

export const REMOVAL_SLA_HOURS = 72;

export interface RemovalRequestInput {
  /** Listing URL, profile slug, or provider/studio name as typed by the requester. */
  listing: string;
  name: string;
  email: string;
  detail?: string;
}

export type RemovalRequestOutcome =
  | { kind: "removed"; providerName: string; reportId: string }
  | { kind: "queued"; providerName: string | null; reportId: string };

/** Best-effort listing key: final URL segment, or the raw text as typed. */
function listingCandidate(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length > 0) return segments[segments.length - 1];
  } catch {
    // Not a URL — treat as slug or name.
  }
  return trimmed;
}

/** Accepts a profile URL, a bare slug, or an exact provider name. */
export function resolveListing(input: string): Provider | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const candidate = listingCandidate(trimmed);
  const bySlug = providerBySlug(candidate) ?? providerBySlug(candidate.toLowerCase());
  if (bySlug) return bySlug;

  const needle = trimmed.toLowerCase();
  return allProviders().find((p) => p.name.toLowerCase() === needle);
}

export function requestRemoval(input: RemovalRequestInput): RemovalRequestOutcome {
  const provider = resolveListing(input.listing);
  const report = fileReport({
    targetType: "provider",
    targetId: provider?.id ?? listingCandidate(input.listing),
    reason: "removal_request",
    detail:
      `${input.name} <${input.email}> requests removal` +
      (provider ? ` of ${provider.name} (${provider.slug})` : ` of "${input.listing.trim()}"`) +
      (input.detail ? ` — ${input.detail}` : ""),
  });

  // Verified ownership: the requester controls the listing's contact address.
  if (provider?.contactEmail && provider.contactEmail.toLowerCase() === input.email.toLowerCase()) {
    honorRemoval(report.id, "auto: requester email matches listing contact");
    return { kind: "removed", providerName: provider.name, reportId: report.id };
  }

  return { kind: "queued", providerName: provider?.name ?? null, reportId: report.id };
}

/**
 * One-click honour in the admin queue: suppress the provider from all public
 * reads, write the permanent re-ingestion tombstone, and resolve the report
 * with an audit trail (REV-7: nothing is removed silently).
 */
export function honorRemoval(reportId: string, by: string): Report | null {
  const report = openReports().find((r) => r.id === reportId);
  if (!report || report.reason !== "removal_request") return null;

  const provider = providerById(report.targetId);
  if (provider) {
    suppressProvider(provider.id);
    recordOptOut({ name: provider.name, citySlug: provider.citySlug });
  }
  return resolveReport(
    reportId,
    "actioned",
    by,
    `Listing removed and permanently suppressed (ING-7, ${REMOVAL_SLA_HOURS}h SLA)`,
  );
}

/** SLA signal for the admin queue: removal requests are due within 72 hours. */
export function removalSlaState(report: Report, now = new Date()): "within" | "overdue" | null {
  if (report.reason !== "removal_request" || report.status !== "open") return null;
  const ageMs = now.getTime() - report.createdAt.getTime();
  return ageMs > REMOVAL_SLA_HOURS * 3_600_000 ? "overdue" : "within";
}
