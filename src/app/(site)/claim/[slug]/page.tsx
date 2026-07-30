import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { outboundContactCount, providerBySlug } from "@/lib/repo";
import { providerPath } from "@/lib/urls";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = providerBySlug(slug);
  if (!provider) return {};
  return {
    title: `Claim ${provider.name} on The Yoga Universe`,
    robots: { index: false },
  };
}

/**
 * ING-6 claim flow. The pitch follows Decision #14: authenticity-first —
 * "this page exists and people are seeing it; claim it so it's yours and
 * correct" — with the performance panel (DASH-7) as supporting evidence,
 * not a growth-hack teaser.
 */
export default async function ClaimPage({ params }: Props) {
  const { slug } = await params;
  const provider = providerBySlug(slug);
  if (!provider) notFound();

  // Demo stats: deterministic page-view figures + the real outbound counter.
  const monthlyViews = 140 + (provider.reviewCount % 90) * 7;
  const searchAppearances = monthlyViews * 6;
  const outbound = outboundContactCount(provider.id) + Math.round(monthlyViews * 0.06);

  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Claim your page</Eyebrow>
      <h1 className="display-2">Is this your page, {provider.name.split(" ")[0]}?</h1>
      <p className="mt-4.5 text-[17px] leading-[1.75] text-article">
        This page was created from publicly available information so that people searching
        for {provider.name} find accurate details. It already exists and people are seeing
        it — claiming it makes it yours: you control the schedule, the wording, the contact
        details, and you can remove it entirely if you prefer.
      </p>

      <div className="grid-fit-150 mt-7 gap-4">
        {[
          { value: searchAppearances, label: "search appearances / month" },
          { value: monthlyViews, label: "page views / month" },
          { value: outbound, label: "outbound contacts / month" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[14px] border border-mint-200 p-5 text-center"
          >
            <p className="font-heading text-[30px] font-light text-forest">
              {stat.value.toLocaleString()}
            </p>
            <p className="mt-1.5 text-[12.5px] text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 className="display-4 mt-10 mb-4.5">How claiming works</h2>
      <ol className="flex list-decimal flex-col gap-2.5 pl-5 text-[16px] leading-[1.75] text-article">
        <li>
          Verify you are {provider.name} — via the email or phone already associated with
          the business, a code posted on your website or social profile, or a document
          check.
        </li>
        <li>The page transfers to your control, with its history intact.</li>
        <li>
          Edit anything, connect your schedule, add credentials for verification — or ask
          us to remove the page permanently.
        </li>
      </ol>
      <div className="mt-7 flex flex-wrap gap-3.5">
        <ButtonLink href="/dashboard" tone="forest">
          Start the claim
        </ButtonLink>
        <ButtonLink href={providerPath(provider)} tone="outline">
          Back to the page
        </ButtonLink>
      </div>
      <p className="mt-6 text-[13px] leading-relaxed text-faint">
        Not you, but something&apos;s wrong on the page? Anyone can{" "}
        <a
          href={`mailto:corrections@example.com?subject=Edit suggestion: ${provider.slug}`}
          className="underline"
        >
          suggest an edit
        </a>
        . Want the page gone? Removal requests are honoured permanently — the listing will
        not be re-created by future imports.
      </p>
    </div>
  );
}
