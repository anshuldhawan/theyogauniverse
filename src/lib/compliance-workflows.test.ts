import { beforeEach, describe, expect, it } from "vitest";
import {
  decideDsaNotice,
  listSanctionsDecisions,
  recordSanctionsDecision,
  resetComplianceWorkflowsForTests,
  submitDataRequest,
  submitDsaNotice,
  transitionDataRequest,
} from "./compliance-workflows";

describe("compliance workflows", () => {
  beforeEach(resetComplianceWorkflowsForTests);

  it("tracks data-request state history and deadline", () => {
    const request = submitDataRequest({
      type: "erasure",
      email: "person@example.com",
      detail: "Erase my account",
      now: new Date("2026-07-01T00:00:00Z"),
    });
    transitionDataRequest(request.id, "identity_verification", "privacy-team");
    expect(request.dueAt.toISOString()).toBe("2026-07-31T00:00:00.000Z");
    expect(request.history.map((row) => row.state)).toEqual([
      "received",
      "identity_verification",
    ]);
  });

  it("requires a DSA statement of reasons", () => {
    const notice = submitDsaNotice({
      targetUrl: "https://example.com/listing",
      category: "illegal_content",
      explanation: "A sufficiently detailed explanation.",
      reporterEmail: "reporter@example.com",
      goodFaithConfirmed: true,
    });
    expect(() => decideDsaNotice(notice.id, "no_action", "")).toThrow();
    expect(decideDsaNotice(notice.id, "no_action", "The cited rule does not apply.")?.status).toBe(
      "no_action",
    );
  });

  it("retains sanctions decision reason and list version", () => {
    recordSanctionsDecision("checkout", "checkout-1", {
      outcome: "block",
      reasonCode: "blocked_jurisdiction",
      country: "IR",
      listVersion: "v2",
    });
    expect(listSanctionsDecisions()[0]).toMatchObject({
      subjectRef: "checkout-1",
      reasonCode: "blocked_jurisdiction",
      listVersion: "v2",
    });
  });
});
