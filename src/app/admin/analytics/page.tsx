import type { Metadata } from "next";
import { Card, SectionLabel } from "@/components/ui";
import {
  calculateDataQuality,
  calculateMarketplaceKpis,
  type SupplySnapshot,
} from "@/lib/analytics-reporting";
import { CITIES } from "@/lib/config/markets";
import { allProviders, organisationById, primaryListingOf } from "@/lib/repo";
import { evaluateListing } from "@/lib/transactability";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";
const REPORTING_AS_OF = Date.parse("2026-07-29T00:00:00Z");

function percentage(value: number | null): string {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export default function AdminAnalyticsPage() {
  const snapshots = allProviders().flatMap<SupplySnapshot>((provider) => {
    const organisation = organisationById(provider.organisationId);
    const listing = primaryListingOf(provider.id);
    if (!organisation || !listing || !provider.citySlug) return [];
    const city = CITIES.find((candidate) => candidate.slug === provider.citySlug);
    const evaluation = evaluateListing(
      {
        supplyType: listing.supplyType,
        performanceCountry: listing.performanceCountry,
        organisationEligibility: organisation.payoutEligibility,
      },
      { country: "US" },
    );
    return [
      {
        city: `${city?.country ?? provider.country?.toLowerCase() ?? "unknown"}:${provider.citySlug}`,
        listingMode: evaluation.state === "bookable" ? "bookable" : "advertising_only",
        providerId: provider.id,
        claimed: provider.provenance === "claimed" || provider.provenance === "native",
        active: listing.status === "published",
        hasAvailability: provider.schedule.length > 0,
        publishedListings: listing.status === "published" ? 1 : 0,
        totalListings: 1,
        verifiedRecords: provider.verificationTier === "self_declared" ? 0 : 1,
        totalRecords: 1,
        duplicateRecords: 0,
        staleRecords:
          REPORTING_AS_OF - new Date(provider.lastVerifiedAt).getTime() > 180 * 86_400_000 ? 1 : 0,
      },
    ];
  });
  const kpis = calculateMarketplaceKpis([], snapshots);
  const quality = calculateDataQuality(snapshots);

  return (
    <div>
      <SectionLabel tone="orange">ANL-2 · ANL-3 · ANL-4 · ANL-5</SectionLabel>
      <h1 className="mt-2 text-3xl">Marketplace analytics</h1>
      <p className="mt-1 max-w-3xl text-sm text-sage-600">
        Transactional KPIs exclude advertising-only outcomes by construction. Those listings expose
        reach only: impressions, profile views and outbound contacts.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["GMV", `$${(kpis.gmvMinor / 100).toFixed(2)}`],
          ["Take rate", percentage(kpis.takeRate)],
          ["Provider activation", percentage(kpis.providerActivationRate.rate)],
          ["Claim rate", percentage(kpis.claimRate.rate)],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-3xl font-semibold text-forest">{value}</p>
            <p className="mt-1 text-sm text-sage-600">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <QualityPanel title="Transactional cities" rows={quality.transactional} />
        <QualityPanel title="Advertising-only cities" rows={quality.advertisingOnly} />
      </div>

      <Card className="mt-6 p-5 text-sm text-sage-600">
        <p className="font-medium text-forest">Experiment and consent controls</p>
        <p className="mt-2">
          Ranking assignments are deterministic on the server and demotion variants are constrained
          to the disclosed 0.80–0.85 range. Optional browser analytics, replay and web-vitals scripts
          remain unloaded until affirmative consent.
        </p>
      </Card>
    </div>
  );
}

function QualityPanel({
  title,
  rows,
}: {
  title: string;
  rows: ReturnType<typeof calculateDataQuality>["transactional"];
}) {
  return (
    <Card className="p-5">
      <h2 className="font-heading text-xl text-forest">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.length === 0 && <p className="text-sm text-sage-600">No seeded records.</p>}
        {rows.map((row) => (
          <div key={row.city} className="flex items-center gap-4 border-t border-mint-200 pt-3 text-sm">
            <span className="min-w-36 font-medium text-forest">{row.city}</span>
            <span>coverage {percentage(row.coverage)}</span>
            <span>fresh {percentage(row.freshnessRate)}</span>
            <span>verified {percentage(row.verificationRate)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
