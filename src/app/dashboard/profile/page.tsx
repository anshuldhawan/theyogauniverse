import Link from "next/link";
import { Card, SectionLabel } from "@/components/ui";
import { resolveDashboardProvider } from "@/lib/dashboard";
import { previewPath, profileCompleteness } from "@/lib/profiles";
import { slotsForProvider } from "@/lib/repo";
import { providerPath } from "@/lib/urls";

interface Props {
  searchParams: Promise<{ as?: string }>;
}

const ACTION_LABELS: Record<string, string> = {
  shortBio: "Add a short bio for search and sharing",
  longBio: "Tell visitors more about your practice",
  photoUrl: "Add a profile photo",
  styles: "Choose the styles you teach",
  languages: "Add your teaching languages",
  contact: "Add a contact method",
  scheduleCount: "Publish your next session",
  credentialCount: "Add a credential for review",
};

export default async function DashboardProfilePage({ searchParams }: Props) {
  const { as } = await searchParams;
  const provider = resolveDashboardProvider(as);
  const completeness = profileCompleteness({
    name: provider.name,
    shortBio: provider.tagline,
    longBio: provider.bio,
    photoUrl: null,
    styles: provider.styles,
    languages: [],
    contact: provider.contactEmail ?? provider.website,
    scheduleCount: slotsForProvider(provider.id).length,
    credentialCount: provider.verificationTier === "self_declared" ? 0 : 1,
  });

  return (
    <div className="max-w-3xl">
      <SectionLabel>Public profile</SectionLabel>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">{provider.name}</h1>
          <p className="mt-1 text-sm text-sage-600">
            Complete profiles are easier to discover and trust.
          </p>
        </div>
        <Link
          href={previewPath(providerPath(provider))}
          className="rounded-full border border-forest px-5 py-2.5 text-sm text-forest"
        >
          Preview as visitor
        </Link>
      </div>

      <Card className="mt-8 p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <SectionLabel>Profile completeness</SectionLabel>
            <p className="mt-2 font-heading text-4xl text-forest">{completeness.score}%</p>
          </div>
          <p className="text-sm text-sage-600">
            {completeness.missing.length
              ? `${completeness.missing.length} suggested improvements`
              : "Your profile is complete"}
          </p>
        </div>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-mint"
          role="progressbar"
          aria-label="Profile completeness"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completeness.score}
        >
          <div
            className="h-full rounded-full bg-leaf"
            style={{ width: `${completeness.score}%` }}
          />
        </div>
      </Card>

      {completeness.missing.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg">Recommended next actions</h2>
          <ol className="mt-3 grid gap-3">
            {completeness.missing.map((field, index) => (
              <Card key={field} className="flex items-center gap-4 p-4">
                <span className="flex size-8 items-center justify-center rounded-full bg-mint text-sm text-forest">
                  {index + 1}
                </span>
                <span className="text-sm text-forest">
                  {ACTION_LABELS[field] ?? `Complete ${field}`}
                </span>
              </Card>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
