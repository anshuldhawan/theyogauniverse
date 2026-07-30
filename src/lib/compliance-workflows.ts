import { randomUUID } from "node:crypto";
import {
  dataRequestDueAt,
  type SanctionsDecision,
  type DataRequestState,
  type DataRequestType,
} from "./compliance";

export interface DataSubjectRequest {
  id: string;
  type: DataRequestType;
  email: string;
  detail: string;
  state: DataRequestState;
  receivedAt: Date;
  dueAt: Date;
  history: { state: DataRequestState; at: Date; actor: string; reason?: string }[];
}

export type DsaNoticeCategory =
  | "illegal_content"
  | "unsafe_service"
  | "impersonation"
  | "intellectual_property"
  | "other";

export interface DsaNotice {
  id: string;
  targetUrl: string;
  category: DsaNoticeCategory;
  explanation: string;
  reporterEmail: string;
  goodFaithConfirmed: boolean;
  status: "received" | "in_review" | "actioned" | "no_action";
  receivedAt: Date;
  statementOfReasons: string | null;
}

const dataRequests: DataSubjectRequest[] = [];
const dsaNotices: DsaNotice[] = [];
const sanctionsLog: (SanctionsDecision & {
  id: string;
  subjectType: "checkout" | "contact";
  subjectRef: string;
  createdAt: Date;
})[] = [];

export function submitDataRequest(input: {
  type: DataRequestType;
  email: string;
  detail: string;
  now?: Date;
}): DataSubjectRequest {
  const now = input.now ?? new Date();
  const request: DataSubjectRequest = {
    id: randomUUID(),
    type: input.type,
    email: input.email,
    detail: input.detail,
    state: "received",
    receivedAt: now,
    dueAt: dataRequestDueAt(now),
    history: [{ state: "received", at: now, actor: "requester" }],
  };
  dataRequests.push(request);
  return request;
}

export function transitionDataRequest(
  id: string,
  state: DataRequestState,
  actor: string,
  reason?: string,
): DataSubjectRequest | null {
  const request = dataRequests.find((item) => item.id === id);
  if (!request) return null;
  request.state = state;
  request.history.push({ state, at: new Date(), actor, reason });
  return request;
}

export function listDataRequests(): readonly DataSubjectRequest[] {
  return dataRequests;
}

export function submitDsaNotice(input: Omit<DsaNotice, "id" | "status" | "receivedAt" | "statementOfReasons">): DsaNotice {
  if (!input.goodFaithConfirmed) throw new Error("Good-faith confirmation is required.");
  const notice: DsaNotice = {
    ...input,
    id: randomUUID(),
    status: "received",
    receivedAt: new Date(),
    statementOfReasons: null,
  };
  dsaNotices.push(notice);
  return notice;
}

export function decideDsaNotice(
  id: string,
  status: "actioned" | "no_action",
  statementOfReasons: string,
): DsaNotice | null {
  if (!statementOfReasons.trim()) throw new Error("A statement of reasons is required.");
  const notice = dsaNotices.find((item) => item.id === id);
  if (!notice) return null;
  notice.status = status;
  notice.statementOfReasons = statementOfReasons;
  return notice;
}

export function listDsaNotices(): readonly DsaNotice[] {
  return dsaNotices;
}

export function recordSanctionsDecision(
  subjectType: "checkout" | "contact",
  subjectRef: string,
  decision: SanctionsDecision,
) {
  const row = { ...decision, id: randomUUID(), subjectType, subjectRef, createdAt: new Date() };
  sanctionsLog.push(row);
  return row;
}

export function listSanctionsDecisions() {
  return sanctionsLog;
}

export function resetComplianceWorkflowsForTests(): void {
  dataRequests.length = 0;
  dsaNotices.length = 0;
  sanctionsLog.length = 0;
}
