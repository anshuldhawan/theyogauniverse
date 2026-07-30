/**
 * ADM-1..ADM-9 operational domain services.
 *
 * These classes are storage-agnostic: production adapters can persist their
 * snapshots and audit events in Postgres, while tests and the demo console use
 * the same rules in memory. Mutations always emit an immutable audit event.
 */

export type AdminEntityStatus = "active" | "unpublished" | "merged";

export interface AdminRecord {
  id: string;
  entityType: string;
  status: AdminEntityStatus;
  data: Record<string, unknown>;
  version: number;
}

export interface AdminAuditEvent {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  at: Date;
  rollbackOf?: string;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function eventId(): string {
  return crypto.randomUUID();
}

/** ADM-1: generic record operations with reversible, full snapshots. */
export class RecordOperations {
  private readonly records = new Map<string, AdminRecord>();
  private readonly events: AdminAuditEvent[] = [];

  constructor(initial: AdminRecord[] = []) {
    for (const record of initial) this.records.set(record.id, clone(record));
  }

  search(query: string, entityType?: string): AdminRecord[] {
    const needle = query.trim().toLocaleLowerCase();
    return [...this.records.values()]
      .filter((record) => !entityType || record.entityType === entityType)
      .filter(
        (record) =>
          !needle ||
          record.id.toLocaleLowerCase().includes(needle) ||
          JSON.stringify(record.data).toLocaleLowerCase().includes(needle),
      )
      .map(clone);
  }

  get(id: string): AdminRecord | undefined {
    const record = this.records.get(id);
    return record ? clone(record) : undefined;
  }

  auditLog(entityId?: string): AdminAuditEvent[] {
    return this.events.filter((event) => !entityId || event.entityId === entityId).map(clone);
  }

  edit(id: string, patch: Record<string, unknown>, actor: string): AdminRecord {
    return this.mutate(id, actor, "record.edited", (record) => ({
      ...record,
      data: { ...record.data, ...clone(patch) },
    }));
  }

  unpublish(id: string, actor: string): AdminRecord {
    return this.mutate(id, actor, "record.unpublished", (record) => ({
      ...record,
      status: "unpublished",
    }));
  }

  merge(survivorId: string, duplicateIds: string[], actor: string): AdminRecord {
    if (duplicateIds.includes(survivorId)) throw new Error("Survivor cannot be a duplicate");
    const survivor = this.require(survivorId);
    const duplicates = duplicateIds.map((id) => this.require(id));
    if (duplicates.some((record) => record.entityType !== survivor.entityType)) {
      throw new Error("Only records of the same entity type can be merged");
    }
    const merged = this.mutate(survivorId, actor, "record.merged_survivor", (record) => ({
      ...record,
      data: Object.assign({}, ...duplicates.map((item) => item.data), record.data, {
        mergedRecordIds: duplicateIds,
      }),
    }));
    for (const duplicate of duplicates) {
      this.mutate(duplicate.id, actor, "record.merged_duplicate", (record) => ({
        ...record,
        status: "merged",
        data: { ...record.data, mergedIntoId: survivorId },
      }));
    }
    return merged;
  }

  split(
    sourceId: string,
    children: Array<{ id: string; data: Record<string, unknown> }>,
    actor: string,
  ): AdminRecord[] {
    const source = this.require(sourceId);
    if (children.length < 2) throw new Error("A split requires at least two child records");
    if (children.some((child) => this.records.has(child.id))) throw new Error("Child id already exists");
    const created = children.map<AdminRecord>((child) => ({
      id: child.id,
      entityType: source.entityType,
      status: "active",
      data: { ...clone(child.data), splitFromId: sourceId },
      version: 1,
    }));
    for (const record of created) this.records.set(record.id, record);
    this.unpublish(sourceId, actor);
    for (const record of created) {
      this.recordEvent(actor, "record.split_child_created", record, null, record);
    }
    return clone(created);
  }

  rollback(auditEventId: string, actor: string): AdminRecord {
    const original = this.events.find((event) => event.id === auditEventId);
    if (!original || !original.before) throw new Error("Audit event cannot be rolled back");
    const current = this.require(original.entityId);
    const restored = { ...(clone(original.before) as AdminRecord), version: current.version + 1 };
    this.records.set(restored.id, restored);
    this.recordEvent(actor, "record.rollback", restored, current, restored, original.id);
    return clone(restored);
  }

  private mutate(
    id: string,
    actor: string,
    action: string,
    update: (record: AdminRecord) => AdminRecord,
  ): AdminRecord {
    if (!actor.trim()) throw new Error("Actor is required");
    const before = this.require(id);
    const after = { ...update(clone(before)), version: before.version + 1 };
    this.records.set(id, after);
    this.recordEvent(actor, action, after, before, after);
    return clone(after);
  }

  private require(id: string): AdminRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Record not found: ${id}`);
    return clone(record);
  }

  private recordEvent(
    actor: string,
    action: string,
    record: AdminRecord,
    before: unknown,
    after: unknown,
    rollbackOf?: string,
  ): void {
    this.events.push({
      id: eventId(),
      actor,
      action,
      entityType: record.entityType,
      entityId: record.id,
      before: clone(before),
      after: clone(after),
      at: new Date(),
      rollbackOf,
    });
  }
}

export type VerificationKind = "credential" | "insurance" | "claim" | "disputed_claim";
export type QueueStatus = "open" | "assigned" | "resolved";

export interface VerificationCase {
  id: string;
  kind: VerificationKind;
  subjectId: string;
  status: QueueStatus;
  openedAt: Date;
  dueAt: Date;
  assignee: string | null;
  resolution: string | null;
}

/** ADM-2: assignable verification queues with explicit SLA state. */
export class VerificationQueue {
  private readonly cases = new Map<string, VerificationCase>();
  private readonly events: AdminAuditEvent[] = [];

  open(kind: VerificationKind, subjectId: string, slaHours: number, now = new Date()): VerificationCase {
    if (slaHours <= 0) throw new Error("SLA must be positive");
    const item: VerificationCase = {
      id: eventId(),
      kind,
      subjectId,
      status: "open",
      openedAt: now,
      dueAt: new Date(now.getTime() + slaHours * 3_600_000),
      assignee: null,
      resolution: null,
    };
    this.cases.set(item.id, item);
    return clone(item);
  }

  assign(id: string, assignee: string, actor: string): VerificationCase {
    return this.change(id, actor, "verification.assigned", (item) => ({
      ...item,
      status: "assigned",
      assignee,
    }));
  }

  resolve(id: string, resolution: string, actor: string): VerificationCase {
    if (!resolution.trim()) throw new Error("Resolution is required");
    return this.change(id, actor, "verification.resolved", (item) => ({
      ...item,
      status: "resolved",
      resolution,
    }));
  }

  list(kind?: VerificationKind): VerificationCase[] {
    return [...this.cases.values()].filter((item) => !kind || item.kind === kind).map(clone);
  }

  slaState(item: VerificationCase, now = new Date()): "on_track" | "due_soon" | "overdue" | "met" {
    if (item.status === "resolved") return "met";
    if (now >= item.dueAt) return "overdue";
    return item.dueAt.getTime() - now.getTime() <= 4 * 3_600_000 ? "due_soon" : "on_track";
  }

  auditLog(): AdminAuditEvent[] {
    return this.events.map(clone);
  }

  private change(
    id: string,
    actor: string,
    action: string,
    update: (item: VerificationCase) => VerificationCase,
  ): VerificationCase {
    const before = this.cases.get(id);
    if (!before) throw new Error(`Verification case not found: ${id}`);
    if (before.status === "resolved") throw new Error("Resolved cases are immutable");
    const after = update(clone(before));
    this.cases.set(id, after);
    this.events.push({
      id: eventId(),
      actor,
      action,
      entityType: "verification_case",
      entityId: id,
      before: clone(before),
      after: clone(after),
      at: new Date(),
    });
    return clone(after);
  }
}

export interface TaxonomyTerm {
  id: string;
  labels: Record<string, string>;
  synonyms: Record<string, string[]>;
  active: boolean;
}

/** ADM-4: locale-aware terms and normalized synonym lookup. */
export class TaxonomyCatalog {
  private readonly terms = new Map<string, TaxonomyTerm>();

  upsert(term: TaxonomyTerm): void {
    if (!term.labels.en?.trim()) throw new Error("An English label is required");
    this.terms.set(term.id, clone(term));
  }

  resolve(value: string, locale = "en"): TaxonomyTerm | undefined {
    const normalized = value.trim().toLocaleLowerCase(locale);
    const match = [...this.terms.values()].find((term) => {
      const candidates = [
        ...Object.values(term.labels),
        ...Object.values(term.synonyms).flat(),
      ].map((candidate) => candidate.toLocaleLowerCase(locale));
      return term.active && candidates.includes(normalized);
    });
    return match ? clone(match) : undefined;
  }

  translate(id: string, locale: string): string | undefined {
    const term = this.terms.get(id);
    return term?.labels[locale] ?? term?.labels.en;
  }
}

export interface FinancialOperation {
  id: string;
  kind: "manual_refund" | "payout_adjustment" | "escrow_release" | "commission_override";
  targetId: string;
  amountMinor?: number;
  currency?: string;
  commissionBps?: number;
  reason: string;
  requestedBy: string;
  approvals: string[];
  status: "pending" | "approved" | "executed";
}

export interface ReconciliationLine {
  reference: string;
  ledgerAmount: number;
  stripeAmount: number;
  difference: number;
  status: "matched" | "mismatch";
}

/** ADM-6 policy engine. Payment-provider execution belongs in an adapter. */
export class FinancialOperations {
  private readonly operations = new Map<string, FinancialOperation>();
  private readonly events: AdminAuditEvent[] = [];

  request(input: Omit<FinancialOperation, "id" | "approvals" | "status">): FinancialOperation {
    if (!input.reason.trim()) throw new Error("A documented reason is required");
    if (input.amountMinor !== undefined && (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0)) {
      throw new Error("Amount must be a positive integer in minor units");
    }
    if (input.kind === "commission_override" && input.commissionBps === undefined) {
      throw new Error("Commission basis points are required");
    }
    const operation: FinancialOperation = {
      ...input,
      id: eventId(),
      approvals: [],
      status: "pending",
    };
    this.operations.set(operation.id, operation);
    return clone(operation);
  }

  approve(id: string, approver: string): FinancialOperation {
    const before = this.require(id);
    if (before.requestedBy === approver) throw new Error("Requester cannot approve their own operation");
    if (before.approvals.includes(approver)) throw new Error("Approver must be distinct");
    const required = before.kind === "escrow_release" ? 2 : 1;
    const approvals = [...before.approvals, approver];
    const after: FinancialOperation = {
      ...before,
      approvals,
      status: approvals.length >= required ? "approved" : "pending",
    };
    this.operations.set(id, after);
    this.log(approver, "finance.approved", before, after);
    return clone(after);
  }

  markExecuted(id: string, actor: string): FinancialOperation {
    const before = this.require(id);
    if (before.status !== "approved") throw new Error("Operation has not received required approval");
    const after = { ...before, status: "executed" as const };
    this.operations.set(id, after);
    this.log(actor, "finance.executed", before, after);
    return clone(after);
  }

  reconcile(
    ledger: Array<{ reference: string; amount: number }>,
    stripe: Array<{ reference: string; amount: number }>,
  ): ReconciliationLine[] {
    const references = new Set([...ledger.map((line) => line.reference), ...stripe.map((line) => line.reference)]);
    return [...references].sort().map((reference) => {
      const ledgerAmount = ledger.find((line) => line.reference === reference)?.amount ?? 0;
      const stripeAmount = stripe.find((line) => line.reference === reference)?.amount ?? 0;
      const difference = stripeAmount - ledgerAmount;
      return {
        reference,
        ledgerAmount,
        stripeAmount,
        difference,
        status: difference === 0 ? "matched" : "mismatch",
      };
    });
  }

  auditLog(): AdminAuditEvent[] {
    return this.events.map(clone);
  }

  private require(id: string): FinancialOperation {
    const operation = this.operations.get(id);
    if (!operation) throw new Error(`Financial operation not found: ${id}`);
    if (operation.status === "executed") throw new Error("Executed operations are immutable");
    return clone(operation);
  }

  private log(actor: string, action: string, before: FinancialOperation, after: FinancialOperation): void {
    this.events.push({
      id: eventId(),
      actor,
      action,
      entityType: "financial_operation",
      entityId: after.id,
      before: clone(before),
      after: clone(after),
      at: new Date(),
    });
  }
}

export interface ImpersonationSession {
  id: string;
  adminId: string;
  organisationId: string;
  consentedBy: string;
  reason: string;
  startedAt: Date;
  expiresAt: Date;
  endedAt: Date | null;
}

/** ADM-7: consent-gated, short-lived, fully audited support access. */
export class ImpersonationService {
  private readonly sessions = new Map<string, ImpersonationSession>();
  private readonly events: AdminAuditEvent[] = [];

  start(input: {
    adminId: string;
    organisationId: string;
    consentedBy: string;
    reason: string;
    consentGranted: boolean;
    now?: Date;
  }): ImpersonationSession {
    if (!input.consentGranted || !input.consentedBy.trim()) throw new Error("Provider consent is required");
    if (!input.reason.trim()) throw new Error("Support reason is required");
    const now = input.now ?? new Date();
    const session: ImpersonationSession = {
      id: eventId(),
      adminId: input.adminId,
      organisationId: input.organisationId,
      consentedBy: input.consentedBy,
      reason: input.reason,
      startedAt: now,
      expiresAt: new Date(now.getTime() + 30 * 60_000),
      endedAt: null,
    };
    this.sessions.set(session.id, session);
    this.log(input.adminId, "impersonation.started", session);
    return clone(session);
  }

  isActive(id: string, now = new Date()): boolean {
    const session = this.sessions.get(id);
    return Boolean(session && !session.endedAt && now < session.expiresAt);
  }

  end(id: string, adminId: string, now = new Date()): ImpersonationSession {
    const session = this.sessions.get(id);
    if (!session || session.adminId !== adminId) throw new Error("Session not found");
    const ended = { ...session, endedAt: now };
    this.sessions.set(id, ended);
    this.log(adminId, "impersonation.ended", ended);
    return clone(ended);
  }

  auditLog(): AdminAuditEvent[] {
    return this.events.map(clone);
  }

  private log(actor: string, action: string, session: ImpersonationSession): void {
    this.events.push({
      id: eventId(),
      actor,
      action,
      entityType: "impersonation_session",
      entityId: session.id,
      before: null,
      after: clone(session),
      at: new Date(),
    });
  }
}

export type PrivacyRequestKind = "access" | "rectification" | "erasure" | "portability";

export interface PrivacyRequest {
  id: string;
  subjectId: string;
  kind: PrivacyRequestKind;
  openedAt: Date;
  dueAt: Date;
  status: "identity_verification" | "in_progress" | "completed" | "rejected";
  assignedTo: string | null;
  completedAt: Date | null;
  resultRef: string | null;
}

/** ADM-8: identity-gated rights workflow with statutory SLA timers. */
export class PrivacyRequestConsole {
  private readonly requests = new Map<string, PrivacyRequest>();

  open(subjectId: string, kind: PrivacyRequestKind, now = new Date()): PrivacyRequest {
    const request: PrivacyRequest = {
      id: eventId(),
      subjectId,
      kind,
      openedAt: now,
      dueAt: new Date(now.getTime() + 30 * 86_400_000),
      status: "identity_verification",
      assignedTo: null,
      completedAt: null,
      resultRef: null,
    };
    this.requests.set(request.id, request);
    return clone(request);
  }

  verifyAndAssign(id: string, assignee: string): PrivacyRequest {
    const request = this.require(id);
    const updated = { ...request, status: "in_progress" as const, assignedTo: assignee };
    this.requests.set(id, updated);
    return clone(updated);
  }

  complete(id: string, resultRef: string, now = new Date()): PrivacyRequest {
    const request = this.require(id);
    if (request.status !== "in_progress") throw new Error("Identity must be verified first");
    if (!resultRef.trim()) throw new Error("Completion evidence is required");
    const updated = {
      ...request,
      status: "completed" as const,
      completedAt: now,
      resultRef,
    };
    this.requests.set(id, updated);
    return clone(updated);
  }

  slaState(id: string, now = new Date()): "on_track" | "due_soon" | "overdue" | "met" {
    const request = this.require(id);
    if (request.status === "completed") return "met";
    if (now >= request.dueAt) return "overdue";
    return request.dueAt.getTime() - now.getTime() <= 5 * 86_400_000 ? "due_soon" : "on_track";
  }

  private require(id: string): PrivacyRequest {
    const request = this.requests.get(id);
    if (!request) throw new Error(`Privacy request not found: ${id}`);
    return clone(request);
  }
}

export interface CityActivationInput {
  slug: string;
  country: string;
  tier: "transactional" | "advertising_only";
  timezone: string;
  taxTrack: "A" | "B";
  payoutEligible: boolean;
  live: boolean;
}

export interface CityActivationPlan extends CityActivationInput {
  routes: string[];
  activatedAt: Date;
}

/** ADM-9: validates and materializes a city's complete configuration plan. */
export function activateCity(input: CityActivationInput, now = new Date()): CityActivationPlan {
  if (!/^[a-z]{2}$/.test(input.country)) throw new Error("Country must be lowercase ISO alpha-2");
  if (!input.slug.trim() || !input.timezone.includes("/")) throw new Error("Slug and IANA timezone are required");
  if (input.tier === "transactional" && !input.payoutEligible) {
    throw new Error("Transactional cities require payout eligibility");
  }
  return {
    ...input,
    routes: [
      `/${input.country}/${input.slug}/yoga`,
      `/studios/${input.country}/${input.slug}`,
      `/schools/${input.country}/${input.slug}`,
    ],
    activatedAt: now,
  };
}
