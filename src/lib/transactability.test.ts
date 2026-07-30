import { describe, expect, it } from "vitest";
import { evaluateListing, type BuyerContext } from "./transactability";
import type { PayoutEligibility } from "./types";

const usActive: PayoutEligibility = {
  domicileCountry: "US",
  connectStatus: "active",
  connectAccountId: "acct_1",
};
const usRestricted: PayoutEligibility = {
  domicileCountry: "US",
  connectStatus: "restricted",
  connectAccountId: "acct_1",
};
const german: PayoutEligibility = {
  domicileCountry: "DE",
  connectStatus: "none",
  connectAccountId: null,
};

const usBuyer: BuyerContext = { country: "US" };
const ukBuyer: BuyerContext = { country: "GB" };
const unknownBuyer: BuyerContext = { country: null };

describe("transactability (§4.3 / DM-7)", () => {
  it("US provider, US in-person class → bookable to any buyer", () => {
    const listing = {
      supplyType: "in_person" as const,
      performanceCountry: "US",
      organisationEligibility: usActive,
    };
    expect(evaluateListing(listing, usBuyer).state).toBe("bookable");
    expect(evaluateListing(listing, ukBuyer).state).toBe("bookable");
    expect(evaluateListing(listing, unknownBuyer).state).toBe("bookable");
  });

  it("US-domiciled organiser, retreat held in Portugal → enquiry_only (payable but no treatment; PAY-10 edge case)", () => {
    const result = evaluateListing(
      {
        supplyType: "in_person",
        performanceCountry: "PT",
        organisationEligibility: usActive,
      },
      usBuyer,
    );
    expect(result.state).toBe("enquiry_only");
    expect(result.payable).toBe(true);
    expect(result.taxTractable).toBe(false);
  });

  it("German studio in a US city → enquiry_only (fails payability; §4.2 note)", () => {
    const result = evaluateListing(
      {
        supplyType: "in_person",
        performanceCountry: "US",
        organisationEligibility: german,
      },
      usBuyer,
    );
    expect(result.state).toBe("enquiry_only");
    expect(result.payable).toBe(false);
    expect(result.taxTractable).toBe(true);
  });

  it("online listing from US provider → bookable to US buyer only (PAY-11a, Decision #12)", () => {
    const listing = {
      supplyType: "online_live" as const,
      performanceCountry: null,
      organisationEligibility: usActive,
    };
    expect(evaluateListing(listing, usBuyer).state).toBe("bookable");
    expect(evaluateListing(listing, ukBuyer).state).toBe("enquiry_only");
    expect(evaluateListing(listing, { country: "DE" }).state).toBe("enquiry_only");
    expect(evaluateListing(listing, { country: "AU" }).state).toBe("enquiry_only");
  });

  it("online listing, buyer location unknown → enquiry_only (PAY-11: block, do not guess)", () => {
    const result = evaluateListing(
      {
        supplyType: "online_live",
        performanceCountry: null,
        organisationEligibility: usActive,
      },
      unknownBuyer,
    );
    expect(result.state).toBe("enquiry_only");
  });

  it("Track B results are request-scoped; Track A are not (DM-7 caching rule)", () => {
    const online = evaluateListing(
      { supplyType: "on_demand", performanceCountry: null, organisationEligibility: usActive },
      usBuyer,
    );
    const inPerson = evaluateListing(
      { supplyType: "in_person", performanceCountry: "US", organisationEligibility: usActive },
      usBuyer,
    );
    expect(online.requestScoped).toBe(true);
    expect(online.taxTrack).toBe("B");
    expect(inPerson.requestScoped).toBe(false);
    expect(inPerson.taxTrack).toBe("A");
  });

  it("Connect account restricted by Stripe → listings drop to enquiry_only (PAY-4)", () => {
    const result = evaluateListing(
      {
        supplyType: "in_person",
        performanceCountry: "US",
        organisationEligibility: usRestricted,
      },
      usBuyer,
    );
    expect(result.state).toBe("enquiry_only");
  });
});
