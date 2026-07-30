import { describe, expect, it } from "vitest";
import { money } from "./money";
import {
  applyPromo,
  bookingIcs,
  depositSchedule,
  instalmentSchedule,
  joinWaitlist,
  promoteFromWaitlist,
  redeemCredit,
  redeemGiftCard,
  refundFor,
  waitlistPosition,
  type CancellationPolicy,
  type Waitlist,
} from "./offers";

const now = new Date("2026-08-01T12:00:00Z");

describe("waitlist (BKG-4)", () => {
  const empty: Waitlist = { entries: [], maxSize: 2, responseWindowHours: 4 };

  it("tracks position, caps size, and promotes FIFO", () => {
    let list = joinWaitlist(empty, "a@x.com", now)!;
    list = joinWaitlist(list, "b@x.com", now)!;
    expect(waitlistPosition(list, "b@x.com")).toBe(2);
    expect(joinWaitlist(list, "c@x.com", now)).toBeNull();

    const { promoted, remaining } = promoteFromWaitlist(list);
    expect(promoted?.email).toBe("a@x.com");
    expect(waitlistPosition(remaining, "b@x.com")).toBe(1);
  });
});

describe("refund ladder (BKG-6)", () => {
  const policy: CancellationPolicy = {
    ladder: [
      { minHoursBefore: 48, refundBps: 10_000 },
      { minHoursBefore: 12, refundBps: 5_000 },
      { minHoursBefore: 0, refundBps: 0 },
    ],
    creditInsteadOfRefund: false,
  };

  it("applies the right rung of the ladder", () => {
    const paid = money(3000, "USD");
    expect(refundFor(policy, paid, 72).amount.amount).toBe(3000);
    expect(refundFor(policy, paid, 24).amount.amount).toBe(1500);
    expect(refundFor(policy, paid, 1).amount.amount).toBe(0);
  });
});

describe("deposit + instalments (BKG-8/9)", () => {
  it("splits deposit and balance, balance never due before booking", () => {
    const total = money(100_000, "USD");
    const startsAt = new Date("2026-12-01T00:00:00Z");
    const schedule = depositSchedule(total, 2_500, now, startsAt, 30);
    expect(schedule[0].amount.amount).toBe(25_000);
    expect(schedule[1].amount.amount).toBe(75_000);
    expect(schedule[0].amount.amount + schedule[1].amount.amount).toBe(total.amount);

    const late = depositSchedule(total, 2_500, new Date("2026-11-25T00:00:00Z"), startsAt, 30);
    expect(late[1].dueAt.getTime()).toBe(new Date("2026-11-25T00:00:00Z").getTime());
  });

  it("instalments sum exactly to the total (DM-4)", () => {
    const schedule = instalmentSchedule(money(100_001, "USD"), 3, now);
    expect(schedule).toHaveLength(3);
    expect(schedule.reduce((sum, item) => sum + item.amount.amount, 0)).toBe(100_001);
    expect(schedule[0].amount.amount).toBeGreaterThan(schedule[1].amount.amount);
  });
});

describe("class packs (BKG-11)", () => {
  it("redeems until exhausted or expired", () => {
    const pack = { creditsTotal: 2, creditsUsed: 1, expiresAt: new Date("2026-09-01"), transferable: false };
    const used = redeemCredit(pack, now)!;
    expect(used.creditsUsed).toBe(2);
    expect(redeemCredit(used, now)).toBeNull();
    expect(redeemCredit(pack, new Date("2026-10-01"))).toBeNull();
  });
});

describe("promo codes (BKG-14)", () => {
  const promo = {
    code: "SUMMER20",
    kind: "percent" as const,
    value: 2_000,
    usesRemaining: 5,
    validFrom: new Date("2026-07-01"),
    validUntil: new Date("2026-09-01"),
    stackable: false,
  };

  it("applies percentage discounts inside the window", () => {
    const result = applyPromo(money(5000, "USD"), promo, now);
    expect(result).toEqual({
      price: money(4000, "USD"),
      discount: money(1000, "USD"),
    });
  });

  it("rejects expired and currency-mismatched codes", () => {
    expect("error" in applyPromo(money(5000, "USD"), promo, new Date("2026-10-01"))).toBe(true);
    const fixed = { ...promo, kind: "fixed" as const, value: 500, currency: "EUR" };
    expect("error" in applyPromo(money(5000, "USD"), fixed, now)).toBe(true);
  });
});

describe("gift cards (BKG-13)", () => {
  it("covers up to the balance and tracks the remainder", () => {
    const { card, covered, remainderDue } = redeemGiftCard(
      { code: "GIFT", balance: money(2000, "USD") },
      money(3500, "USD"),
    );
    expect(covered.amount).toBe(2000);
    expect(remainderDue.amount).toBe(1500);
    expect(card.balance.amount).toBe(0);
  });
});

describe("calendar export (BKG-16)", () => {
  it("emits a valid VEVENT with escaped fields", () => {
    const ics = bookingIcs({
      uid: "b-1",
      title: "Ashtanga, Led Primary",
      location: "Studio; Brooklyn",
      startsAtUtc: new Date("2026-08-02T13:00:00Z"),
      endsAtUtc: new Date("2026-08-02T14:30:00Z"),
      description: "Bring a mat",
    });
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:20260802T130000Z");
    expect(ics).toContain("SUMMARY:Ashtanga\\, Led Primary");
    expect(ics).toContain("LOCATION:Studio\\; Brooklyn");
  });
});
