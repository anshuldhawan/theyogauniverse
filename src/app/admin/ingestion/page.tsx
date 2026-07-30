import type { Metadata } from "next";
import { Card, SectionLabel } from "@/components/ui";
import { sourceMayRun, type SourcePolicy } from "@/lib/ingestion";

export const metadata: Metadata = { title: "Ingestion staging" };

const SOURCES: SourcePolicy[] = [
  {
    sourceId: "provider-owned-sites",
    baseUrl: "Provider-owned public websites",
    robotsAllowed: true,
    termsPermitIngestion: true,
    requestsPerMinute: 6,
    reviewedAt: "2026-07-29",
    notes: "Durable public facts only; no schedules, prices or images.",
  },
  {
    sourceId: "restricted-directory-example",
    baseUrl: "Restricted third-party directory",
    robotsAllowed: false,
    termsPermitIngestion: false,
    requestsPerMinute: 0,
    reviewedAt: "2026-07-29",
    notes: "Blocked. Explicit prohibition; connector must not run.",
  },
];

export default function IngestionAdminPage() {
  return (
    <div>
      <SectionLabel>ING-1 / 8 / 10</SectionLabel>
      <h1 className="mt-2 text-3xl">Ingestion staging</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-sage-600">
        Connectors stop before fetch when robots or source terms prohibit use. Candidates retain
        field-level source, method, observation time and agent version. Schedules, prices and copied
        images are rejected from automated publication.
      </p>

      <section className="mt-8">
        <h2 className="text-lg">Source legal register</h2>
        <div className="mt-3 space-y-3">
          {SOURCES.map((source) => {
            const permission = sourceMayRun(source);
            return (
              <Card key={source.sourceId} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{source.baseUrl}</h3>
                    <p className="mt-1 text-xs text-sage-600">
                      Reviewed {source.reviewedAt} · limit {source.requestsPerMinute}/min
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    permission.allowed ? "bg-leaf/15 text-leaf" : "bg-orange/15 text-orange"
                  }`}>
                    {permission.allowed ? "connector allowed" : "blocked"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-sage-600">
                  {permission.reason ?? source.notes}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><strong>Publishable</strong><p className="mt-2 text-sm text-sage-600">Confidence ≥ 0.75, no conflict, durable fields only.</p></Card>
        <Card className="p-5"><strong>Needs review</strong><p className="mt-2 text-sm text-sage-600">Low confidence or possible cross-city duplicate.</p></Card>
        <Card className="p-5"><strong>Suppressed</strong><p className="mt-2 text-sm text-sage-600">Permanent opt-out tombstone matched before publish.</p></Card>
      </section>
    </div>
  );
}
