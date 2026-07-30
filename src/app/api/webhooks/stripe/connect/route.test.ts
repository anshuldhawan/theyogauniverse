import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  organisationById,
  primaryListingOf,
  providerBySlug,
  updateOrganisationConnect,
} from "@/lib/repo";
import { evaluateListing } from "@/lib/transactability";
import { POST } from "./route";

const WEBHOOK_SECRET = "whsec_connect_test_secret";
const ACCOUNT_ID = "acct_test_health_monitoring";

/** Reset the in-memory store between tests. */
beforeEach(() => {
  (globalThis as Record<string, unknown>).__theYogaUniverseStore = undefined;
  process.env.STRIPE_CONNECT_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

afterEach(() => {
  delete process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
});

/** A payable US seed organisation, pinned to a known Connect account id. */
function activeOrganisation() {
  const provider = providerBySlug("koji");
  if (!provider) throw new Error("seed provider missing");
  const organisation = updateOrganisationConnect(provider.organisationId, {
    connectAccountId: ACCOUNT_ID,
    connectStatus: "active",
  });
  if (!organisation) throw new Error("seed organisation missing");
  return { provider, organisation };
}

function accountUpdatedEvent(account: Record<string, unknown>) {
  return { id: "evt_acct_1", type: "account.updated", data: { object: account } };
}

function signedRequest(event: Record<string, unknown>, secret = WEBHOOK_SECRET): Request {
  const payload = JSON.stringify(event);
  const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("http://localhost/api/webhooks/stripe/connect", {
    method: "POST",
    headers: { "stripe-signature": signature, "content-type": "application/json" },
    body: payload,
  });
}

describe("Stripe Connect webhook receiver (PAY-4)", () => {
  it("rejects payloads with an invalid signature", async () => {
    const { provider } = activeOrganisation();
    const response = await POST(
      signedRequest(
        accountUpdatedEvent({ id: ACCOUNT_ID, charges_enabled: false, payouts_enabled: false }),
        "whsec_wrong_secret",
      ),
    );
    expect(response.status).toBe(400);
    expect(
      organisationById(provider.organisationId)?.payoutEligibility.connectStatus,
    ).toBe("active");
  });

  it("restricts the organisation on a verification lapse and flips listings to enquiry_only", async () => {
    const { provider } = activeOrganisation();
    const response = await POST(
      signedRequest(
        accountUpdatedEvent({
          id: ACCOUNT_ID,
          country: "US",
          details_submitted: true,
          charges_enabled: false,
          payouts_enabled: false,
          requirements: {
            disabled_reason: "requirements.past_due",
            currently_due: ["individual.id_number"],
          },
        }),
      ),
    );
    expect(response.status).toBe(200);

    const organisation = organisationById(provider.organisationId)!;
    expect(organisation.payoutEligibility.connectStatus).toBe("restricted");

    // DM-7: transactability is derived, so the drop is immediate.
    const listing = primaryListingOf(provider.id)!;
    const result = evaluateListing(
      {
        supplyType: listing.supplyType,
        performanceCountry: listing.performanceCountry,
        organisationEligibility: organisation.payoutEligibility,
      },
      { country: "US" },
    );
    expect(result.state).toBe("enquiry_only");
  });

  it("re-activates the organisation once Stripe re-verifies the account", async () => {
    const { provider } = activeOrganisation();
    updateOrganisationConnect(provider.organisationId, { connectStatus: "restricted" });

    const response = await POST(
      signedRequest(
        accountUpdatedEvent({
          id: ACCOUNT_ID,
          country: "US",
          details_submitted: true,
          charges_enabled: true,
          payouts_enabled: true,
          requirements: { disabled_reason: null, currently_due: [] },
        }),
      ),
    );
    expect(response.status).toBe(200);
    expect(
      organisationById(provider.organisationId)?.payoutEligibility.connectStatus,
    ).toBe("active");
  });

  it("ignores accounts that do not map to an organisation", async () => {
    const response = await POST(
      signedRequest(
        accountUpdatedEvent({ id: "acct_unknown", charges_enabled: false }),
      ),
    );
    expect(response.status).toBe(200);
  });
});
