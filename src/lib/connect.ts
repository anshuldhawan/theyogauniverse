/**
 * PAY-3 / PAY-4 — Stripe Connect account lifecycle for provider payouts.
 *
 * PAY-3: Express onboarding (Stripe hosts the KYC/AML flow; no identity
 * documents ever touch this server), payout schedules (daily/weekly/monthly),
 * statement descriptor, and the Express dashboard for payout history /
 * failed-payout retry. Single country (US) and single currency (USD).
 *
 * PAY-2: accounts are created with country=US only, and deriveConnectStatus
 * refuses to mark a non-US account active — the hard gate is structural.
 *
 * PAY-4: `account.updated` webhooks funnel through deriveConnectStatus →
 * updateOrganisationConnect. Transactability (DM-7) is derived per request
 * from connectStatus, so listings drop to `enquiry_only` immediately — there
 * is no cached "bookable" column to invalidate.
 *
 * Same pattern as src/lib/payments.ts: the Stripe implementation activates
 * when STRIPE_SECRET_KEY is set; otherwise a deterministic mock keeps the
 * dev/CI flow working end to end.
 */

import type Stripe from "stripe";
import type { ConnectStatus } from "./types";

export type PayoutInterval = "daily" | "weekly" | "monthly";

/** The subset of a Stripe Account we make decisions on. */
export interface ConnectAccountSnapshot {
  accountId: string;
  country: string | null;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  /** requirements.disabled_reason — null while the account is in good standing. */
  disabledReason: string | null;
  /** requirements.currently_due — field names Stripe still needs. */
  currentlyDue: string[];
  payoutInterval: PayoutInterval | "manual" | null;
}

/**
 * Map a Connect account snapshot to our lifecycle status (PAY-4).
 * Ordering matters: an explicit disabled_reason wins over enabled flags.
 */
export function deriveConnectStatus(snapshot: ConnectAccountSnapshot): ConnectStatus {
  // PAY-2 hard gate: a non-US account can never become active. No override.
  if (snapshot.country && snapshot.country.toUpperCase() !== "US") return "restricted";
  if (snapshot.disabledReason) {
    const terminal =
      snapshot.disabledReason.startsWith("rejected") ||
      snapshot.disabledReason === "platform_paused";
    return terminal ? "disabled" : "restricted";
  }
  if (snapshot.chargesEnabled && snapshot.payoutsEnabled) return "active";
  if (!snapshot.detailsSubmitted) return "onboarding";
  return "restricted";
}

/**
 * PAY-4: the notification must carry a *specific* remediation path, never a
 * bare "your account has a problem".
 */
export function connectRemediation(
  status: ConnectStatus,
  currentlyDue: string[],
): string | null {
  switch (status) {
    case "onboarding":
      return "Finish Stripe onboarding to start taking paid bookings.";
    case "restricted":
      return currentlyDue.length > 0
        ? `Stripe needs updated information (${currentlyDue.join(", ")}). ` +
            "Open Payouts in your dashboard and complete verification to restore online booking."
        : "Stripe has paused payouts on your account. Open Payouts in your dashboard and complete verification to restore online booking.";
    case "disabled":
      return "Your payout account was disabled after Stripe's review. Reply to this email to appeal. Until resolved, your listings run in advertising mode and confirmed bookings are honoured.";
    default:
      return null;
  }
}

/** Adapter from the raw Stripe Account object (API fetches and webhooks). */
export function snapshotFromStripeAccount(account: Stripe.Account): ConnectAccountSnapshot {
  return {
    accountId: account.id,
    country: account.country ?? null,
    detailsSubmitted: Boolean(account.details_submitted),
    chargesEnabled: Boolean(account.charges_enabled),
    payoutsEnabled: Boolean(account.payouts_enabled),
    disabledReason: account.requirements?.disabled_reason ?? null,
    currentlyDue: account.requirements?.currently_due ?? [],
    payoutInterval:
      (account.settings?.payouts?.schedule?.interval as PayoutInterval | "manual" | undefined) ??
      null,
  };
}

/* ------------------------------- service ---------------------------------- */

export interface ConnectService {
  name: string;
  /** Create a US Express account for an Organisation (PAY-2/PAY-3). */
  createExpressAccount(input: {
    organisationId: string;
    organisationName: string;
    email: string | null;
  }): Promise<{ ok: boolean; accountId: string; error?: string }>;
  /** Stripe-hosted onboarding / requirements-update flow (Account Link). */
  onboardingLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string,
  ): Promise<{ ok: boolean; url: string; error?: string }>;
  fetchAccount(accountId: string): Promise<ConnectAccountSnapshot | null>;
  /** One-time login link to the Express dashboard (payout history, retries). */
  dashboardLoginLink(accountId: string): Promise<{ ok: boolean; url: string; error?: string }>;
  /** PAY-3: payout schedule per organisation. */
  setPayoutSchedule(accountId: string, interval: PayoutInterval): Promise<{ ok: boolean }>;
}

/** Statement descriptor (PAY-3): ≤22 chars, what buyers' banks show. */
const STATEMENT_DESCRIPTOR = "THE YOGA UNIVERSE";

/**
 * Deterministic mock: onboarding "completes" instantly — the account link
 * points straight back at the return URL and fetchAccount reports a fully
 * verified US account, so the dashboard flow can be exercised without keys.
 */
class MockConnectService implements ConnectService {
  name = "mock";

  private intervals(): Map<string, PayoutInterval> {
    const g = globalThis as unknown as { __theYogaUniverseConnectIntervals?: Map<string, PayoutInterval> };
    g.__theYogaUniverseConnectIntervals ??= new Map();
    return g.__theYogaUniverseConnectIntervals;
  }

  async createExpressAccount(input: { organisationId: string }) {
    return { ok: true, accountId: `acct_mock_${input.organisationId}` };
  }

  async onboardingLink(_accountId: string, returnUrl: string) {
    return { ok: true, url: returnUrl };
  }

  async fetchAccount(accountId: string): Promise<ConnectAccountSnapshot> {
    return {
      accountId,
      country: "US",
      detailsSubmitted: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      disabledReason: null,
      currentlyDue: [],
      payoutInterval: this.intervals().get(accountId) ?? "daily",
    };
  }

  async dashboardLoginLink() {
    return { ok: false, url: "", error: "Express dashboard requires live Stripe keys." };
  }

  async setPayoutSchedule(accountId: string, interval: PayoutInterval) {
    this.intervals().set(accountId, interval);
    return { ok: true };
  }
}

class StripeConnectService implements ConnectService {
  name = "stripe";

  private async client() {
    const { default: StripeSdk } = await import("stripe");
    return new StripeSdk(process.env.STRIPE_SECRET_KEY!);
  }

  async createExpressAccount(input: {
    organisationId: string;
    organisationName: string;
    email: string | null;
  }) {
    const stripe = await this.client();
    try {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US", // PAY-2: US-only, no exceptions
        email: input.email ?? undefined,
        business_profile: { name: input.organisationName },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        settings: {
          payouts: {
            schedule: { interval: "daily" },
            statement_descriptor: STATEMENT_DESCRIPTOR,
          },
        },
        metadata: { organisation_id: input.organisationId },
      });
      return { ok: true, accountId: account.id };
    } catch (error) {
      return {
        ok: false,
        accountId: "",
        error: error instanceof Error ? error.message : "account_creation_failed",
      };
    }
  }

  async onboardingLink(accountId: string, returnUrl: string, refreshUrl: string) {
    const stripe = await this.client();
    try {
      const link = await stripe.accountLinks.create({
        account: accountId,
        return_url: returnUrl,
        refresh_url: refreshUrl,
        type: "account_onboarding",
      });
      return { ok: true, url: link.url };
    } catch (error) {
      return {
        ok: false,
        url: "",
        error: error instanceof Error ? error.message : "account_link_failed",
      };
    }
  }

  async fetchAccount(accountId: string): Promise<ConnectAccountSnapshot | null> {
    const stripe = await this.client();
    try {
      const account = await stripe.accounts.retrieve(accountId);
      return snapshotFromStripeAccount(account);
    } catch {
      return null;
    }
  }

  async dashboardLoginLink(accountId: string) {
    const stripe = await this.client();
    try {
      const link = await stripe.accounts.createLoginLink(accountId);
      return { ok: true, url: link.url };
    } catch (error) {
      return {
        ok: false,
        url: "",
        error: error instanceof Error ? error.message : "login_link_failed",
      };
    }
  }

  async setPayoutSchedule(accountId: string, interval: PayoutInterval) {
    const stripe = await this.client();
    try {
      await stripe.accounts.update(accountId, {
        settings: { payouts: { schedule: { interval } } },
      });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }
}

/** Connect only needs the secret key (no browser half, unlike the payment rail). */
export function connectRailActive(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function connectService(): ConnectService {
  if (connectRailActive()) return new StripeConnectService();
  return new MockConnectService();
}
