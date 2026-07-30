import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ProviderProfile } from "@/components/site/ProviderProfile";
import { RelatedEditorial } from "@/components/site/RelatedEditorial";
import { buyerContext } from "@/lib/buyer";
import { articlesByTeacherSlug } from "@/lib/editorial/store";
import { providerView } from "@/lib/listing-view";
import { providerByOldSlug, providerBySlug } from "@/lib/repo";
import type { ProviderKind } from "@/lib/types";
import { providerPath } from "@/lib/urls";

/** Shared loader for the PRO-1 profile routes. */
export function providerMetadata(slug: string, kinds: ProviderKind[]): Metadata {
  const provider = providerBySlug(slug);
  if (!provider || !kinds.includes(provider.kind)) return {};
  return {
    title: provider.name,
    description: provider.tagline.slice(0, 160), // PRO-4: short bio as meta description
    alternates: { canonical: providerPath(provider) },
  };
}

export async function ProviderPage({ slug, kinds }: { slug: string; kinds: ProviderKind[] }) {
  const provider = providerBySlug(slug);
  if (!provider) {
    const renamed = providerByOldSlug(slug);
    if (renamed && kinds.includes(renamed.kind)) permanentRedirect(providerPath(renamed));
    notFound();
  }
  if (!kinds.includes(provider.kind)) notFound();
  const buyer = await buyerContext();
  // BLG-29: teachers who write or review for the editorial library get their
  // work surfaced on their commercial profile (and vice versa via bylines).
  const editorial = provider.kind === "teacher" ? articlesByTeacherSlug(slug) : [];
  return (
    <>
      <ProviderProfile view={providerView(provider, buyer)} />
      {editorial.length > 0 && (
        <div className="shell pb-[clamp(48px,7vw,90px)]">
          <RelatedEditorial
            articles={editorial}
            heading={`Guides ${provider.name} wrote or reviewed`}
          />
        </div>
      )}
    </>
  );
}
