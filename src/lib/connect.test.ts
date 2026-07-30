import { describe, expect, it } from "vitest";
import {
  connectRemediation,
  connectService,
  deriveConnectStatus,
  type ConnectAccountSnapshot,
} from "./connect";

function snapshot(overrides: Partial<ConnectAccountSnapshot> = {}): ConnectAccountSnapshot {
  return {
    accountId: "acct_test",
    country: "US",
    detailsSubmitted: true,
    chargesEnabled: true,
    payoutsEnabled: true,
    disabledReason: null,
    currentlyDue: [],
    payoutInterval: "daily",
    ...overrides,
  };
}

describe("deriveConnectStatus (PAY-2/PAY-4)", () => {
  it("marks a fully verified US account active", () => {
    expect(deriveConnectStatus(snapshot())).toBe("active");
  });

  it("never activates a non-US account (PAY-2 hard gate)", () => {
    expect(deriveConnectStatus(snapshot({ country: "GB" }))).toBe("restricted");
  });

  it("reports onboarding while details are not submitted", () => {
    expect(
      deriveConnectStatus(
        snapshot({ detailsSubmitted: false, chargesEnabled: false, payoutsEnabled: false }),
      ),
    ).toBe("onboarding");
  });

  it("restricts on a verification lapse (disabled_reason wins over enabled flags)", () => {
    expect(
      deriveConnectStatus(snapshot({ disabledReason: "requirements.past_due" })),
    ).toBe("restricted");
  });

  it("restricts when submitted but capabilities are not enabled", () => {
    expect(
      deriveConnectStatus(snapshot({ chargesEnabled: false, payoutsEnabled: false })),
    ).toBe("restricted");
  });

  it("disables on terminal reasons (rejected.*, platform_paused)", () => {
    expect(deriveConnectStatus(snapshot({ disabledReason: "rejected.fraud" }))).toBe("disabled");
    expect(deriveConnectStatus(snapshot({ disabledReason: "platform_paused" }))).toBe("disabled");
  });
});

describe("connectRemediation (PAY-4: specific remediation path)", () => {
  it("names the outstanding requirements when restricted", () => {
    const text = connectRemediation("restricted", ["individual.id_number"]);
    expect(text).toContain("individual.id_number");
  });

  it("has no remediation for a healthy account", () => {
    expect(connectRemediation("active", [])).toBeNull();
  });
});

describe("mock connect service (dev/CI rail)", () => {
  it("runs the onboarding flow end to end without Stripe keys", async () => {
    const service = connectService();
    expect(service.name).toBe("mock");

    const created = await service.createExpressAccount({
      organisationId: "org-test",
      organisationName: "Test Studio",
      email: "owner@example.com",
    });
    expect(created.ok).toBe(true);

    const link = await service.onboardingLink(
      created.accountId,
      "http://localhost/return",
      "http://localhost/refresh",
    );
    expect(link.ok).toBe(true);
    expect(link.url).toBe("http://localhost/return");

    const account = await service.fetchAccount(created.accountId);
    expect(account && deriveConnectStatus(account)).toBe("active");
  });

  it("persists the payout schedule (PAY-3)", async () => {
    const service = connectService();
    await service.setPayoutSchedule("acct_mock_x", "monthly");
    const account = await service.fetchAccount("acct_mock_x");
    expect(account?.payoutInterval).toBe("monthly");
  });
});
