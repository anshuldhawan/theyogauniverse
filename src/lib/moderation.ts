/**
 * TSF — trust & safety moderation queue. Reports from any surface land in a
 * single queue with reason codes; resolution is logged with the acting admin
 * and outcome (never silent). Velocity limits on reporting are handled by
 * the shared rate limiter (TSF-9).
 */

export const REPORT_REASONS = [
  "impersonation",
  "misleading_credentials",
  "inappropriate_content",
  "safety_concern",
  "safeguarding",
  "professional_misconduct",
  "payment_solicitation",
  "phishing",
  "spam",
  "wrong_information",
  "removal_request",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export type ReportStatus = "open" | "actioned" | "dismissed";

export interface Report {
  id: string;
  targetType: "provider" | "review" | "message";
  targetId: string;
  reason: ReportReason;
  detail: string;
  createdAt: Date;
  status: ReportStatus;
  resolution?: { by: string; outcome: string; at: Date };
}

const queue: Report[] = [];

export function fileReport(input: {
  targetType: Report["targetType"];
  targetId: string;
  reason: ReportReason;
  detail: string;
}): Report {
  const report: Report = {
    id: `rpt-${queue.length + 1}-${Date.now().toString(36)}`,
    ...input,
    createdAt: new Date(),
    status: "open",
  };
  queue.push(report);
  return report;
}

export function openReports(): Report[] {
  return queue.filter((r) => r.status === "open");
}

export function resolveReport(
  id: string,
  status: Exclude<ReportStatus, "open">,
  by: string,
  outcome: string,
): Report | null {
  const report = queue.find((r) => r.id === id);
  if (!report || report.status !== "open") return null;
  report.status = status;
  report.resolution = { by, outcome, at: new Date() };
  return report;
}

/** TSF: repeated open reports against one target escalate for priority review. */
export function escalationLevel(targetId: string): "none" | "elevated" | "urgent" {
  const count = queue.filter((r) => r.targetId === targetId && r.status === "open").length;
  if (count >= 3) return "urgent";
  if (count >= 2) return "elevated";
  return "none";
}

export type ModerationSeverity = "low" | "medium" | "high" | "critical";

export function reportSeverity(reason: ReportReason): ModerationSeverity {
  if (reason === "safeguarding" || reason === "safety_concern") return "critical";
  if (
    reason === "professional_misconduct" ||
    reason === "impersonation" ||
    reason === "payment_solicitation" ||
    reason === "phishing"
  ) {
    return "high";
  }
  if (reason === "misleading_credentials" || reason === "inappropriate_content") return "medium";
  return "low";
}

export interface ModerationTriage {
  severity: ModerationSeverity;
  slaHours: number;
  suspendPendingReview: boolean;
  requiresLegalReview: boolean;
  handling: string[];
}

/** TSF-2: allegation-sensitive escalation that preserves evidence and avoids republication. */
export function triageReport(report: Pick<Report, "reason">): ModerationTriage {
  const severity = reportSeverity(report.reason);
  const misconduct =
    report.reason === "professional_misconduct" || report.reason === "safeguarding";
  return {
    severity,
    slaHours: severity === "critical" ? 1 : severity === "high" ? 24 : severity === "medium" ? 72 : 120,
    suspendPendingReview: severity === "critical",
    requiresLegalReview: misconduct,
    handling: misconduct
      ? [
          "preserve original allegation and evidence",
          "restrict access to need-to-know reviewers",
          "use neutral allegation language",
          "offer the subject a documented response opportunity where safe",
          "record counsel decision before public statements",
        ]
      : ["preserve evidence", "record reviewer and outcome"],
  };
}

export interface ContentModerationResult {
  decision: "allow" | "human_review" | "reject";
  labels: string[];
  slaHours: number | null;
}

/** TSF-3/9: deterministic first-pass screening; ambiguous material goes to humans. */
export function moderateContent(
  text: string,
  imageSignals: Array<"adult" | "violence" | "medical" | "safe"> = [],
): ContentModerationResult {
  const labels: string[] = [];
  if (/\b(?:gift card|crypto|wire transfer|pay outside|whatsapp payment)\b/i.test(text)) {
    labels.push("payment_scam");
  }
  if (/\b(?:password|one-time code|seed phrase|verify your account here)\b/i.test(text)) {
    labels.push("credential_phishing");
  }
  if (/\b(?:kill|rape|child abuse)\b/i.test(text)) labels.push("severe_safety");
  if (imageSignals.some((signal) => signal !== "safe")) labels.push(...imageSignals.filter((s) => s !== "safe"));
  if (labels.includes("severe_safety") || labels.includes("adult")) {
    return { decision: "reject", labels, slaHours: 1 };
  }
  if (labels.length) return { decision: "human_review", labels, slaHours: 24 };
  return { decision: "allow", labels, slaHours: null };
}

export type ProviderStanding = "active" | "suspended" | "delisted";

export interface StandingEvent {
  at: Date;
  actor: string;
  from: ProviderStanding;
  to: ProviderStanding;
  reason: string;
  evidenceRefs: string[];
}

export interface ProviderCase {
  id: string;
  providerId: string;
  standing: ProviderStanding;
  events: StandingEvent[];
  appeal?: {
    filedAt: Date;
    statement: string;
    evidenceRefs: string[];
    status: "pending" | "upheld" | "overturned";
    decidedBy?: string;
    decisionReason?: string;
  };
}

export function changeProviderStanding(
  current: ProviderCase,
  input: Omit<StandingEvent, "from">,
): ProviderCase {
  if (!input.actor.trim() || !input.reason.trim()) throw new Error("Actor and reason are required.");
  return {
    ...current,
    standing: input.to,
    events: [...current.events, { ...input, from: current.standing }],
  };
}

export function fileStandingAppeal(
  current: ProviderCase,
  input: { filedAt: Date; statement: string; evidenceRefs: string[] },
): ProviderCase {
  if (current.standing === "active") throw new Error("Only a suspension or delisting can be appealed.");
  if (current.appeal?.status === "pending") throw new Error("An appeal is already pending.");
  return { ...current, appeal: { ...input, status: "pending" } };
}

export function decideStandingAppeal(
  current: ProviderCase,
  input: { actor: string; outcome: "upheld" | "overturned"; reason: string; at: Date },
): ProviderCase {
  if (current.appeal?.status !== "pending") throw new Error("No pending appeal.");
  const next = {
    ...current,
    appeal: {
      ...current.appeal,
      status: input.outcome,
      decidedBy: input.actor,
      decisionReason: input.reason,
    },
  };
  return input.outcome === "overturned"
    ? changeProviderStanding(next, {
        at: input.at,
        actor: input.actor,
        to: "active",
        reason: `Appeal overturned: ${input.reason}`,
        evidenceRefs: current.appeal.evidenceRefs,
      })
    : next;
}

export type IdentityMethod = "email_domain" | "phone" | "social_handle" | "google_business";

export interface ClaimContest {
  providerId: string;
  claimantId: string;
  identityMethod: IdentityMethod;
  evidenceRefs: string[];
  competingClaimIds: string[];
  status: "verified" | "contested" | "rejected";
}

export function assessClaimIdentity(input: {
  providerId: string;
  claimantId: string;
  identityMethod: IdentityMethod;
  evidenceRefs: string[];
  existingClaimantIds: string[];
}): ClaimContest {
  const contested = input.existingClaimantIds.some((id) => id !== input.claimantId);
  return {
    providerId: input.providerId,
    claimantId: input.claimantId,
    identityMethod: input.identityMethod,
    evidenceRefs: input.evidenceRefs,
    competingClaimIds: input.existingClaimantIds.filter((id) => id !== input.claimantId),
    status: contested ? "contested" : input.evidenceRefs.length ? "verified" : "rejected",
  };
}

export function minorsVerificationRequired(input: {
  offersMinorsClasses: boolean;
  country: string;
  checks: string[];
}): { publishable: boolean; requiredCheck: string | null } {
  if (!input.offersMinorsClasses) return { publishable: true, requiredCheck: null };
  const country = input.country.toUpperCase();
  const requiredCheck =
    country === "GB" ? "DBS" : country === "AU" ? "WWCC" : "local_child_safety_check";
  return { publishable: input.checks.includes(requiredCheck), requiredCheck };
}

export interface TransparencyMetrics {
  period: string;
  reportsReceived: number;
  reportsActioned: number;
  suspensions: number;
  delistings: number;
  appealsFiled: number;
  appealsOverturned: number;
}

export function transparencyReport(metrics: TransparencyMetrics): TransparencyMetrics & {
  actionRate: number;
  appealOverturnRate: number;
} {
  return {
    ...metrics,
    actionRate: metrics.reportsReceived ? metrics.reportsActioned / metrics.reportsReceived : 0,
    appealOverturnRate: metrics.appealsFiled ? metrics.appealsOverturned / metrics.appealsFiled : 0,
  };
}
