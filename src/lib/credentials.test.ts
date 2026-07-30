import { describe, expect, it } from "vitest";
import {
  CREDENTIAL_FAMILIES,
  evaluateCredential,
  manualQueue,
  publicCredentialView,
  registryRecheckQueue,
  type CredentialRecord,
} from "./credentials";

const registry: CredentialRecord = {
  id: "c1",
  kind: "registry",
  status: "verified",
  expiresAt: new Date("2026-09-01T00:00:00Z"),
  lastCheckedAt: new Date("2026-06-01T00:00:00Z"),
  documentRef: "private://certificate",
};

describe("credential verification controls (CRD)", () => {
  it("never exposes private document references (CRD-3)", () => {
    const view = publicCredentialView(registry);
    expect(view).toEqual({ id: "c1", tier: "registry_verified", status: "verified" });
    expect(view).not.toHaveProperty("documentRef");
  });

  it("warns 30 days ahead and downgrades at expiry (CRD-2/5)", () => {
    const warning = evaluateCredential(registry, new Date("2026-08-10T00:00:00Z"));
    expect(warning.notifications[0]?.kind).toBe("expiry_warning");
    expect(warning.credential.status).toBe("verified");

    const lapsed = evaluateCredential(registry, new Date("2026-09-01T00:00:00Z"));
    expect(lapsed.credential.status).toBe("lapsed");
    expect(lapsed.notifications[0]?.kind).toBe("downgraded");
    expect(publicCredentialView(lapsed.credential).tier).toBe("self_declared");
  });

  it("queues registry records whose scheduled check is due (CRD-2)", () => {
    const fresh = {
      ...registry,
      id: "fresh",
      lastCheckedAt: new Date("2026-07-20T00:00:00Z"),
    };
    expect(
      registryRecheckQueue(
        [fresh, registry, { ...registry, id: "document", kind: "document" }],
        new Date("2026-08-01T00:00:00Z"),
      ).map((item) => item.id),
    ).toEqual(["c1"]);
  });

  it("supports required non-registry credential families (CRD-4)", () => {
    expect(CREDENTIAL_FAMILIES).toEqual(
      expect.arrayContaining([
        "iyengar",
        "ashtanga_authorisation",
        "meditation_lineage",
        "wim_hof",
        "somatic_therapy",
        "first_aid",
        "safeguarding_dbs",
      ]),
    );
  });

  it("calculates the two-business-day manual-review SLA (CRD-7)", () => {
    const queue = manualQueue(
      [
        { id: "normal", submittedAt: new Date("2026-07-31T12:00:00Z"), priority: "normal" },
        { id: "urgent", submittedAt: new Date("2026-08-03T12:00:00Z"), priority: "urgent" },
      ],
      new Date("2026-08-05T13:00:00Z"),
    );
    expect(queue.map((item) => item.id)).toEqual(["urgent", "normal"]);
    expect(queue[1].dueAt.toISOString()).toBe("2026-08-04T12:00:00.000Z");
    expect(queue[1].overdue).toBe(true);
  });
});
