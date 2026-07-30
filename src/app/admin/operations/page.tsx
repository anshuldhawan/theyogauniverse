import type { Metadata } from "next";
import { Card, SectionLabel } from "@/components/ui";
import { activateCity, TaxonomyCatalog, VerificationQueue } from "@/lib/admin-operations";
import { CITIES } from "@/lib/config/markets";

export const metadata: Metadata = { title: "Operations" };
export const dynamic = "force-dynamic";

const capabilities = [
  {
    id: "ADM-1",
    title: "Record management",
    detail: "Search, edit, merge, split, unpublish, full snapshot audit and rollback.",
  },
  {
    id: "ADM-2",
    title: "Verification",
    detail: "Credential, insurance, claim and disputed-claim queues with assignment and SLA state.",
  },
  {
    id: "ADM-4",
    title: "Taxonomy",
    detail: "Locale labels, English fallback, translated synonym lookup and safe term retirement.",
  },
  {
    id: "ADM-6",
    title: "Financial controls",
    detail: "Refund and adjustment requests, commission approval, dual-approved escrow, reconciliation.",
  },
  {
    id: "ADM-7",
    title: "Support access",
    detail: "Consent-gated 30-minute provider impersonation sessions with start/end audit events.",
  },
  {
    id: "ADM-8",
    title: "Privacy rights",
    detail: "Identity-gated access, rectification, erasure and portability workflow with 30-day timers.",
  },
  {
    id: "ADM-9",
    title: "City activation",
    detail: "Validated route, tax-track, payout, tier, timezone and live-state plan from configuration.",
  },
];

export default function AdminOperationsPage() {
  const queue = new VerificationQueue();
  const example = queue.open("credential", "provider-demo", 24);
  const catalog = new TaxonomyCatalog();
  catalog.upsert({
    id: "vinyasa",
    labels: { en: "Vinyasa", es: "Yoga dinámico" },
    synonyms: { en: ["flow yoga"], es: ["flujo"] },
    active: true,
  });
  const cityPlans = CITIES.map((city) =>
    activateCity({
      slug: city.slug,
      country: city.country,
      tier: city.tier,
      timezone: city.timezone,
      taxTrack: city.tier === "transactional" ? "A" : "B",
      payoutEligible: city.country === "us",
      live: true,
    }),
  );

  return (
    <div>
      <SectionLabel tone="orange">ADM-1 · ADM-2 · ADM-4 · ADM-6–9</SectionLabel>
      <h1 className="mt-2 text-3xl">Operations control centre</h1>
      <p className="mt-1 max-w-3xl text-sm text-sage-600">
        Shared policy engines enforce audit, assignment, approval, consent and SLA rules. Provider
        and payment mutations remain adapter-driven so the same controls apply to Postgres and Stripe.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {capabilities.map((capability) => (
          <Card key={capability.id} className="p-5">
            <SectionLabel>{capability.id}</SectionLabel>
            <h2 className="mt-1 font-heading text-xl text-forest">{capability.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-sage-600">{capability.detail}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-3xl font-semibold text-forest">{cityPlans.length}</p>
          <p className="mt-1 text-sm text-sage-600">city activation plans validated</p>
        </Card>
        <Card className="p-5">
          <p className="text-3xl font-semibold text-forest">{queue.slaState(example)}</p>
          <p className="mt-1 text-sm text-sage-600">example verification SLA state</p>
        </Card>
        <Card className="p-5">
          <p className="text-3xl font-semibold text-forest">{catalog.translate("vinyasa", "es")}</p>
          <p className="mt-1 text-sm text-sage-600">example translated taxonomy label</p>
        </Card>
      </div>
    </div>
  );
}
