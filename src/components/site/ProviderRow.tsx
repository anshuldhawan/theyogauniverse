import Link from "next/link";
import { Avatar, BadgeKind, Tag, VerifiedMark } from "@/components/ui";
import {
  categoryLabel,
  isVerified,
  placeLine,
  scheduleSummary,
  styleLabels,
} from "@/lib/listing-view";
import { providerPath } from "@/lib/urls";
import type { Provider } from "@/lib/types";

/**
 * Directory result row. The whole row is the link to the profile, where the
 * book-or-enquire decision is made.
 */
export function ProviderRow({
  provider,
  priceDisplay,
  priceIsIndicative,
}: {
  provider: Provider;
  priceDisplay?: string | null;
  priceIsIndicative?: boolean;
}) {
  return (
    <Link
      href={providerPath(provider)}
      className="flex flex-wrap gap-5 rounded-2xl border border-mint-200 bg-white p-[clamp(16px,2.2vw,24px)] transition-colors hover:border-sage"
    >
      <Avatar id={provider.id} name={provider.name} size={68} fontSize="24px" />
      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <BadgeKind>{categoryLabel(provider.category)}</BadgeKind>
          {isVerified(provider) && <VerifiedMark compact />}
          <h2 className="heading-card text-2xl leading-[1.15]">{provider.name}</h2>
        </div>
        <span className="text-[13px] text-muted">{placeLine(provider)}</span>
        <p className="text-[15px] leading-relaxed text-body text-pretty">
          {provider.tagline}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {styleLabels(provider.styles).map((style) => (
            <Tag key={style}>{style}</Tag>
          ))}
        </div>
        <p className="text-[13px] text-faint">{scheduleSummary(provider.schedule)}</p>
      </div>
      <div className="flex flex-[0_1_120px] flex-col items-start justify-center gap-1.5">
        <span className="text-[15px] font-medium text-forest">{provider.reviewCount}</span>
        <span className="text-[12.5px] text-faint">reviews</span>
        {priceDisplay && (
          <>
            <span className="mt-2 text-[14px] text-forest">{priceDisplay}</span>
            {/* LST-14: an indicative range must always be labelled as one. */}
            {priceIsIndicative && (
              <span className="text-[11.5px] text-faint">indicative</span>
            )}
          </>
        )}
      </div>
    </Link>
  );
}
