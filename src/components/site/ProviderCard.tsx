import Link from "next/link";
import { Avatar, ButtonLink, Card, Tag, VerifiedMark } from "@/components/ui";
import {
  categoryLabel,
  isVerified,
  locationLine,
  styleLabels,
  type ProviderView,
} from "@/lib/listing-view";
import { providerPath } from "@/lib/urls";

/**
 * Grid result card, used on city hubs and cross-links. PRO-13: bookable vs
 * advertising-only differ ONLY in the CTA ("Book" vs "Enquire") — never a
 * badge, warning or downgrade.
 */
export function ProviderCard({ view }: { view: ProviderView }) {
  const { provider, cta, priceDisplay, priceIsIndicative } = view;
  const href = providerPath(provider);

  return (
    <Card hover className="flex h-full flex-col gap-3.5 p-5.5">
      <div className="flex items-center gap-3.5">
        <Avatar id={provider.id} name={provider.name} size={54} />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-orange">
            {categoryLabel(provider.category)}
          </p>
          <Link href={href} className="heading-card text-[21px] leading-tight text-forest">
            {provider.name}
          </Link>
          <p className="mt-1.25 text-[13px] text-muted">{locationLine(provider)}</p>
        </div>
      </div>
      {isVerified(provider) && <VerifiedMark compact />}
      <p className="text-[14.5px] leading-relaxed text-body text-pretty">
        {provider.tagline}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {styleLabels(provider.styles)
          .slice(0, 4)
          .map((style) => (
            <Tag key={style}>{style}</Tag>
          ))}
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-mint pt-3.5">
        <div className="text-[13px] text-muted">
          {provider.reviewCount} reviews
          {priceDisplay && (
            <>
              {" · "}
              <span className="text-forest">
                {priceDisplay}
                {/* LST-14: an indicative range must always be labelled as one. */}
                {priceIsIndicative && (
                  <span title="Indicative range set by the provider, subject to change — confirm directly with them.">
                    {" "}
                    (indicative)
                  </span>
                )}
              </span>
            </>
          )}
        </div>
        <ButtonLink
          href={cta === "book" ? `${href}#classes` : `${href}#contact`}
          tone={cta === "book" ? "primary" : "outline"}
          className="px-4.5 py-3 text-[11.5px] tracking-[0.16em]"
        >
          {cta === "book" ? "Book" : "Enquire"}
        </ButtonLink>
      </div>
    </Card>
  );
}
