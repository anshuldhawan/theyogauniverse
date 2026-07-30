import { describe, expect, it } from "vitest";
import {
  activateCity,
  FinancialOperations,
  ImpersonationService,
  PrivacyRequestConsole,
  RecordOperations,
  TaxonomyCatalog,
  VerificationQueue,
} from "./admin-operations";

describe("RecordOperations (ADM-1)", () => {
  const records = () =>
    new RecordOperations([
      { id: "p-1", entityType: "provider", status: "active", data: { name: "Sun Yoga" }, version: 1 },
      { id: "p-2", entityType: "provider", status: "active", data: { name: "Sun Yoga duplicate" }, version: 1 },
      { id: "l-1", entityType: "listing", status: "active", data: { title: "Flow" }, version: 1 },
    ]);

  it("searches, edits, unpublishes and rolls back with snapshots", () => {
    const operations = records();
    expect(operations.search("sun", "provider")).toHaveLength(2);
    expect(operations.edit("p-1", { name: "Sun Yoga NYC" }, "admin").version).toBe(2);
    operations.unpublish("p-1", "admin");
    const unpublish = operations.auditLog("p-1").at(-1)!;
    expect(operations.get("p-1")?.status).toBe("unpublished");
    expect(operations.rollback(unpublish.id, "supervisor").status).toBe("active");
    expect(operations.auditLog("p-1").at(-1)?.rollbackOf).toBe(unpublish.id);
  });

  it("merges only same-type records and preserves survivor values", () => {
    const operations = records();
    const merged = operations.merge("p-1", ["p-2"], "admin");
    expect(merged.data.name).toBe("Sun Yoga");
    expect(merged.data.mergedRecordIds).toEqual(["p-2"]);
    expect(operations.get("p-2")).toMatchObject({ status: "merged", data: { mergedIntoId: "p-1" } });
    expect(() => operations.merge("p-1", ["l-1"], "admin")).toThrow(/same entity type/);
  });

  it("splits into independently editable records and retires the source", () => {
    const operations = records();
    const children = operations.split(
      "p-1",
      [
        { id: "p-3", data: { name: "Sun Yoga Uptown" } },
        { id: "p-4", data: { name: "Sun Yoga Downtown" } },
      ],
      "admin",
    );
    expect(children).toHaveLength(2);
    expect(operations.get("p-1")?.status).toBe("unpublished");
    expect(operations.get("p-3")?.data.splitFromId).toBe("p-1");
  });
});

describe("VerificationQueue (ADM-2)", () => {
  it("tracks assignment, resolution, audit and SLA state", () => {
    const queue = new VerificationQueue();
    const openedAt = new Date("2026-07-01T00:00:00Z");
    const item = queue.open("disputed_claim", "provider-1", 24, openedAt);
    expect(queue.slaState(item, new Date("2026-07-01T21:00:00Z"))).toBe("due_soon");
    expect(queue.slaState(item, new Date("2026-07-02T00:00:00Z"))).toBe("overdue");
    expect(queue.assign(item.id, "agent-1", "lead")).toMatchObject({
      assignee: "agent-1",
      status: "assigned",
    });
    const resolved = queue.resolve(item.id, "Identity documents matched", "agent-1");
    expect(queue.slaState(resolved)).toBe("met");
    expect(queue.auditLog().map((event) => event.action)).toEqual([
      "verification.assigned",
      "verification.resolved",
    ]);
    expect(() => queue.assign(item.id, "agent-2", "lead")).toThrow(/immutable/);
  });
});

describe("TaxonomyCatalog (ADM-4)", () => {
  it("resolves translated labels and synonyms with English fallback", () => {
    const catalog = new TaxonomyCatalog();
    catalog.upsert({
      id: "vinyasa",
      labels: { en: "Vinyasa", es: "Yoga dinámico" },
      synonyms: { en: ["flow yoga"], es: ["flujo"] },
      active: true,
    });
    expect(catalog.resolve("FLOW YOGA")?.id).toBe("vinyasa");
    expect(catalog.resolve("flujo", "es")?.id).toBe("vinyasa");
    expect(catalog.translate("vinyasa", "es")).toBe("Yoga dinámico");
    expect(catalog.translate("vinyasa", "de")).toBe("Vinyasa");
  });
});

describe("FinancialOperations (ADM-6)", () => {
  it("requires two distinct non-requester approvals for escrow release", () => {
    const finance = new FinancialOperations();
    const request = finance.request({
      kind: "escrow_release",
      targetId: "booking-1",
      amountMinor: 25_000,
      currency: "USD",
      reason: "Provider supplied completion evidence",
      requestedBy: "requester",
    });
    expect(() => finance.approve(request.id, "requester")).toThrow(/cannot approve/);
    expect(finance.approve(request.id, "approver-1").status).toBe("pending");
    expect(() => finance.approve(request.id, "approver-1")).toThrow(/distinct/);
    expect(finance.approve(request.id, "approver-2").status).toBe("approved");
    expect(finance.markExecuted(request.id, "finance-bot").status).toBe("executed");
    expect(finance.auditLog()).toHaveLength(3);
  });

  it("requires the documented commission approval path and reconciles Stripe", () => {
    const finance = new FinancialOperations();
    expect(() =>
      finance.request({
        kind: "commission_override",
        targetId: "org-1",
        reason: "Commercial agreement",
        requestedBy: "sales",
      }),
    ).toThrow(/basis points/);

    expect(
      finance.reconcile(
        [
          { reference: "pi-1", amount: 1000 },
          { reference: "pi-2", amount: 500 },
        ],
        [
          { reference: "pi-1", amount: 1000 },
          { reference: "pi-3", amount: 700 },
        ],
      ),
    ).toEqual([
      { reference: "pi-1", ledgerAmount: 1000, stripeAmount: 1000, difference: 0, status: "matched" },
      { reference: "pi-2", ledgerAmount: 500, stripeAmount: 0, difference: -500, status: "mismatch" },
      { reference: "pi-3", ledgerAmount: 0, stripeAmount: 700, difference: 700, status: "mismatch" },
    ]);
  });
});

describe("ImpersonationService (ADM-7)", () => {
  it("rejects access without consent and expires short-lived sessions", () => {
    const service = new ImpersonationService();
    expect(() =>
      service.start({
        adminId: "admin",
        organisationId: "org",
        consentedBy: "",
        reason: "Schedule support",
        consentGranted: false,
      }),
    ).toThrow(/consent/);

    const now = new Date("2026-07-01T00:00:00Z");
    const session = service.start({
      adminId: "admin",
      organisationId: "org",
      consentedBy: "owner@example.com",
      reason: "Schedule support",
      consentGranted: true,
      now,
    });
    expect(service.isActive(session.id, new Date("2026-07-01T00:29:59Z"))).toBe(true);
    expect(service.isActive(session.id, new Date("2026-07-01T00:30:00Z"))).toBe(false);
    service.end(session.id, "admin", new Date("2026-07-01T00:10:00Z"));
    expect(service.auditLog().map((event) => event.action)).toEqual([
      "impersonation.started",
      "impersonation.ended",
    ]);
  });
});

describe("PrivacyRequestConsole (ADM-8)", () => {
  it("supports every rights type with identity and SLA gates", () => {
    const console = new PrivacyRequestConsole();
    const openedAt = new Date("2026-07-01T00:00:00Z");
    for (const kind of ["access", "rectification", "erasure", "portability"] as const) {
      const request = console.open("subject-1", kind, openedAt);
      expect(request.dueAt).toEqual(new Date("2026-07-31T00:00:00Z"));
      expect(() => console.complete(request.id, "evidence")).toThrow(/verified/);
      console.verifyAndAssign(request.id, "privacy-agent");
      expect(console.complete(request.id, `${kind}-artifact`).status).toBe("completed");
      expect(console.slaState(request.id)).toBe("met");
    }
    const overdue = console.open("subject-2", "access", openedAt);
    expect(console.slaState(overdue.id, new Date("2026-08-01T00:00:00Z"))).toBe("overdue");
  });
});

describe("activateCity (ADM-9)", () => {
  it("builds all city routes from validated configuration", () => {
    const plan = activateCity({
      slug: "new-york",
      country: "us",
      tier: "transactional",
      timezone: "America/New_York",
      taxTrack: "A",
      payoutEligible: true,
      live: true,
    });
    expect(plan.routes).toContain("/us/new-york/yoga");
    expect(plan.routes).toContain("/studios/us/new-york");
  });

  it("refuses transactional activation without payout eligibility", () => {
    expect(() =>
      activateCity({
        slug: "london",
        country: "gb",
        tier: "transactional",
        timezone: "Europe/London",
        taxTrack: "A",
        payoutEligible: false,
        live: true,
      }),
    ).toThrow(/payout eligibility/);
  });
});
