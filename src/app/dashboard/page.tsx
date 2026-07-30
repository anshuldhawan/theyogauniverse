import Link from "next/link";
import { Card, SectionLabel } from "@/components/ui";
import {
  performancePanel,
  providerIsTransactable,
  resolveDashboardProvider,
  transactionPanel,
} from "@/lib/dashboard";
import { formatMoney, money } from "@/lib/money";
import type { Provider } from "@/lib/types";
import { providerPath } from "@/lib/urls";

interface Props {
  searchParams: Promise<{ as?: string }>;
}

export default async function DashboardOverview({ searchParams }: Props) {
  const { as } = await searchParams;
  const provider = resolveDashboardProvider(as);
  const transactable = providerIsTransactable(provider);
  const perf = performancePanel(provider);

  return (
    <div>
      <SectionLabel>Overview</SectionLabel>
      <h1 className="mt-2 text-3xl">{provider.name}</h1>
      <p className="mt-1 text-sm text-sage-600">
        {provider.cityName ?? "Online"} ·{" "}
        <Link href={providerPath(provider)} className="text-leaf underline">
          public page
        </Link>
      </p>

      {/* DASH-7: public-page performance — every provider, always. */}
      <section className="mt-8">
        <h2 className="text-lg">Public page performance (30 days)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-4">
          <Stat label="Profile views" value={perf.profileViews30d.toLocaleString("en-US")} />
          <Stat
            label="Search impressions"
            value={perf.searchImpressions30d.toLocaleString("en-US")}
          />
          <Stat label="Direct contacts forwarded" value={String(perf.outboundContacts)} />
          <Stat label="Published schedule rows" value={String(perf.scheduleRows)} />
        </div>
      </section>

      {/* DASH-8: hide-not-disable — this section does not exist for
          advertising-only providers; no greyed-out upsell. */}
      {transactable && <TransactionSection provider={provider} />}

      {!transactable && (
        <p className="mt-10 max-w-xl text-sm leading-relaxed text-sage-600">
          Your listings run in advertising mode: seekers contact and book with
          you directly, and The Yoga Universe takes no fee. The numbers above are the
          value we deliver — keep your schedule and contact details fresh to
          rank well.
        </p>
      )}
    </div>
  );
}

function TransactionSection({ provider }: { provider: Provider }) {
  const panel = transactionPanel(provider);
  const currency = panel.bookings[0]?.price?.currency ?? "USD";
  return (
    <section className="mt-10">
      <h2 className="text-lg">Bookings & revenue</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <Stat label="Confirmed bookings" value={String(panel.confirmedCount)} />
        <Stat label="Gross (this store)" value={formatMoney(money(panel.grossMinor, currency))} />
        <Stat
          label="Platform commission"
          value={formatMoney(money(panel.commissionMinor, currency))}
        />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {panel.upcomingCapacity.map((slot) => (
          <Card key={slot.slotId} className="flex items-center justify-between p-4">
            <span className="text-sm">{slot.what}</span>
            <span className="text-sm font-medium text-forest">
              {slot.booked}/{slot.capacity} booked
            </span>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-[10.5px] uppercase tracking-[0.18em] text-sage-600">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-forest">{value}</p>
    </Card>
  );
}
