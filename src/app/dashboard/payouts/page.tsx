import type { Metadata } from "next";
import {
  openExpressDashboardAction,
  setPayoutScheduleAction,
  startConnectOnboardingAction,
  syncConnectStatusAction,
} from "@/app/actions/payouts";
import { Button, Card, SectionLabel } from "@/components/ui";
import {
  connectRemediation,
  connectService,
  deriveConnectStatus,
  type ConnectAccountSnapshot,
} from "@/lib/connect";
import { PAYOUT_ELIGIBLE_COUNTRIES } from "@/lib/config/markets";
import { resolveDashboardProvider } from "@/lib/dashboard";
import { accountBalance } from "@/lib/ledger";
import { formatMoney, money } from "@/lib/money";
import { organisationById, updateOrganisationConnect } from "@/lib/repo";
import type { ConnectStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Payouts" };

interface Props {
  searchParams: Promise<{ as?: string; sync?: string; refresh?: string; error?: string }>;
}

const STATUS_META: Record<ConnectStatus, { label: string; badge: string; blurb: string }> = {
  none: {
    label: "Not set up",
    badge: "bg-mint text-forest",
    blurb:
      "Connect a payout account to take paid bookings online. Stripe handles identity verification (KYC) and bank details — none of it touches The Yoga Universe's servers.",
  },
  onboarding: {
    label: "Onboarding in progress",
    badge: "bg-orange/15 text-orange",
    blurb:
      "Your Stripe onboarding isn't finished yet. Until it is, your listings stay in advertising mode.",
  },
  active: {
    label: "Active",
    badge: "bg-leaf/15 text-leaf",
    blurb:
      "Your payout account is verified. Paid bookings route to your bank account automatically, minus the platform commission.",
  },
  restricted: {
    label: "Restricted",
    badge: "bg-orange/15 text-orange",
    blurb:
      "Stripe has paused your account and needs updated information. Online booking is suspended until verification completes; confirmed bookings are honoured.",
  },
  disabled: {
    label: "Disabled",
    badge: "bg-red-100 text-red-700",
    blurb:
      "Stripe disabled this account after review. Your listings run in advertising mode; contact support to appeal.",
  },
};

const ERROR_COPY: Record<string, string> = {
  account_create_failed: "Stripe couldn't create the payout account. Try again in a moment.",
  onboarding_link_failed: "Stripe couldn't start onboarding. Try again in a moment.",
  express_dashboard_unavailable:
    "The Stripe Express dashboard isn't available right now (it requires live Stripe keys).",
};

export default async function PayoutsPage({ searchParams }: Props) {
  const { as, sync, refresh, error } = await searchParams;
  const provider = resolveDashboardProvider(as);
  let organisation = organisationById(provider.organisationId);
  if (!organisation) return null;

  // PAY-2: non-US organisations can never be payable — hide-not-disable
  // (DASH-8): they get the explanation, not a greyed-out setup flow.
  if (!PAYOUT_ELIGIBLE_COUNTRIES.has(organisation.payoutEligibility.domicileCountry.toUpperCase())) {
    return (
      <div>
        <SectionLabel>Payouts</SectionLabel>
        <h1 className="mt-2 text-3xl">Payouts</h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-sage-600">
          Online payments are currently available to US-based organisations
          only. Your listings run in advertising mode: seekers contact and book
          with you directly, and The Yoga Universe takes no fee.
        </p>
      </div>
    );
  }

  const service = connectService();
  const accountId = organisation.payoutEligibility.connectAccountId;
  let snapshot: ConnectAccountSnapshot | null = null;

  if (accountId) {
    snapshot = await service.fetchAccount(accountId);
    // Returning from Stripe onboarding (?sync=1) or an expired Account Link
    // (?refresh=1): sync our lifecycle status from the live account. The
    // Connect webhook (PAY-4) keeps it fresh the rest of the time.
    if (snapshot && (sync === "1" || refresh === "1")) {
      organisation =
        updateOrganisationConnect(organisation.id, {
          connectStatus: deriveConnectStatus(snapshot),
        }) ?? organisation;
    }
  }

  const status = organisation.payoutEligibility.connectStatus;
  const meta = STATUS_META[status];
  const remediation = connectRemediation(status, snapshot?.currentlyDue ?? []);
  const available = accountBalance("provider_payable_available", organisation.id);
  const held = accountBalance("provider_payable_held", organisation.id);

  return (
    <div>
      <SectionLabel>Payouts</SectionLabel>
      <h1 className="mt-2 text-3xl">Payouts</h1>
      <p className="mt-1 text-sm text-sage-600">
        {organisation.name} · powered by Stripe Connect
      </p>

      {error && ERROR_COPY[error] && (
        <p className="mt-4 rounded-xl bg-orange/10 px-4 py-3 text-sm text-orange">
          {ERROR_COPY[error]}
        </p>
      )}

      <Card className="mt-8 p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg">Payout account</h2>
          <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${meta.badge}`}>
            {meta.label}
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sage-600">{meta.blurb}</p>
        {remediation && status !== "onboarding" && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange">{remediation}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          {(status === "none" || status === "onboarding" || status === "restricted") && (
            <form action={startConnectOnboardingAction}>
              <input type="hidden" name="providerSlug" value={provider.slug} />
              <Button tone="primary">
                {status === "none"
                  ? "Set up payouts with Stripe"
                  : status === "onboarding"
                    ? "Continue onboarding"
                    : "Complete verification"}
              </Button>
            </form>
          )}
          {status === "active" && (
            <form action={openExpressDashboardAction}>
              <input type="hidden" name="providerSlug" value={provider.slug} />
              <Button tone="forest">Open Stripe payout dashboard</Button>
            </form>
          )}
          {accountId && (
            <form action={syncConnectStatusAction}>
              <input type="hidden" name="providerSlug" value={provider.slug} />
              <Button tone="outline">Refresh status</Button>
            </form>
          )}
        </div>
      </Card>

      {status === "active" && (
        <>
          <section className="mt-8">
            <h2 className="text-lg">Balance owed to you</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Card className="p-4">
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-sage-600">
                  Available for payout
                </p>
                <p className="mt-1 font-heading text-2xl font-bold text-forest">
                  {formatMoney(money(available, "USD"))}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-sage-600">
                  Held in escrow
                </p>
                <p className="mt-1 font-heading text-2xl font-bold text-forest">
                  {formatMoney(money(held, "USD"))}
                </p>
                <p className="mt-1 text-[12px] text-sage-600">
                  Retreat and training revenue is released at event start.
                </p>
              </Card>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg">Payout schedule</h2>
            <p className="mt-1 text-sm text-sage-600">
              How often Stripe sends your balance to your bank account
              {snapshot?.payoutInterval ? ` (currently ${snapshot.payoutInterval})` : ""}.
            </p>
            <form action={setPayoutScheduleAction} className="mt-3 flex flex-wrap items-center gap-3">
              <input type="hidden" name="providerSlug" value={provider.slug} />
              <select
                name="interval"
                defaultValue={snapshot?.payoutInterval ?? "daily"}
                className="rounded-full border border-mint-200 bg-white px-4 py-2 text-sm text-forest"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <Button tone="outline">Save schedule</Button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
