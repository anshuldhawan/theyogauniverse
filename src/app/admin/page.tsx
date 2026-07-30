import { Card, SectionLabel } from "@/components/ui";
import { TRACK_B_REGIONS } from "@/lib/config/markets";
import { allProviders, organisationById, primaryListingOf } from "@/lib/repo";
import { evaluateListing } from "@/lib/transactability";

/**
 * ADM-10 — transactability console: for any organisation, show WHY it is or
 * isn't transactable (payout eligibility × tax track × performance country),
 * so support never has to guess.
 */
export default function AdminTransactability() {
  const rows = allProviders().map((provider) => {
    const org = organisationById(provider.organisationId);
    const listing = primaryListingOf(provider.id);
    const evaluation =
      org && listing
        ? evaluateListing(
            {
              supplyType: listing.supplyType,
              performanceCountry: listing.performanceCountry,
              organisationEligibility: org.payoutEligibility,
            },
            { country: "US" },
          )
        : null;
    return { provider, org, listing, evaluation };
  });

  const bookable = rows.filter((r) => r.evaluation?.state === "bookable").length;

  return (
    <div>
      <SectionLabel tone="orange">ADM-10</SectionLabel>
      <h1 className="mt-2 text-3xl">Transactability console</h1>
      <p className="mt-1 text-sm text-sage-600">
        {bookable} of {rows.length} organisations bookable (US buyer context). Track B regions
        enabled:{" "}
        {Object.entries(TRACK_B_REGIONS)
          .filter(([, flag]) => flag.enabled)
          .map(([region]) => region)
          .join(", ") || "none"}{" "}
        — toggled in config, never code (PAY-11a / NG-5a).
      </p>

      <div className="mt-8 space-y-2">
        {rows.map(({ provider, org, listing, evaluation }) => (
          <Card key={provider.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
            <span className="min-w-44 font-medium text-forest">{provider.name}</span>
            <span className="text-sage-600">
              domicile {org?.payoutEligibility.domicileCountry ?? "—"} · Connect{" "}
              {org?.payoutEligibility.connectStatus ?? "—"} · supply {listing?.supplyType ?? "—"} ·
              performed {listing?.performanceCountry ?? "online"}
            </span>
            <span
              className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
                evaluation?.state === "bookable"
                  ? "bg-sage/30 text-forest"
                  : "bg-amber/20 text-forest"
              }`}
            >
              {evaluation?.state === "bookable" ? "bookable" : "advertising-only"}
            </span>
            {evaluation && evaluation.state !== "bookable" && (
              <span className="w-full text-xs text-sage-600">
                Why:{" "}
                {!evaluation.payable
                  ? `no active US Connect account (PAY-2 hard gate; domicile ${org?.payoutEligibility.domicileCountry})`
                  : `Track ${evaluation.taxTrack} tax not tractable for this supply/region (PAY-${evaluation.taxTrack === "A" ? "10" : "11a"})`}
              </span>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
