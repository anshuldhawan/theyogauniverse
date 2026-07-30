import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ContactForm } from "@/components/site/ContactForm";
import { ReportForm } from "@/components/site/ReportForm";
import { ShareButton } from "@/components/site/ShareButton";
import {
  Avatar,
  BackLink,
  ButtonLink,
  CardFlat,
  SectionLabel,
  TagHero,
  VerifiedMark,
} from "@/components/ui";
import { track } from "@/lib/analytics";
import {
  categoryLabel,
  isVerified,
  metaLine,
  profileCopy,
  styleLabels,
  type ProviderView,
} from "@/lib/listing-view";
import { formatMoney } from "@/lib/money";
import { slotsForProvider } from "@/lib/repo";

function jsonLdFor(view: ProviderView) {
  const { provider, transactability, listing } = view;
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":
      provider.kind === "studio"
        ? "LocalBusiness"
        : provider.kind === "teacher"
          ? "Person"
          : "Organization",
    name: provider.name,
    description: provider.tagline,
    address: provider.address || undefined,
    url: undefined,
  };
  // SEO-15 Offer honesty: only bookable listings emit a purchasable Offer.
  // Advertising-only pages omit Offer entirely rather than implying InStock.
  if (transactability === "bookable" && listing?.price) {
    base.makesOffer = {
      "@type": "Offer",
      price: (listing.price.amount / 100).toFixed(2),
      priceCurrency: listing.price.currency,
      availability: "https://schema.org/InStock",
    };
  }
  return base;
}

export function ProviderProfile({ view }: { view: ProviderView }) {
  const { provider, transactability, cta, priceDisplay, priceIsIndicative } = view;
  const copy = profileCopy(provider.category);
  const bookable = transactability === "bookable";
  const slots = bookable ? slotsForProvider(provider.id) : [];

  // ANL: profile view — permitted for both transactability states (PAY-17a).
  track({
    name: "profile_view",
    subjectTransactability: transactability,
    payload: { providerId: provider.id },
  });

  return (
    <>
      <JsonLd data={jsonLdFor(view)} />

      {/* Hero */}
      <section className="bg-forest text-white">
        <div className="shell pt-[clamp(28px,4vw,48px)] pb-[clamp(36px,5vw,64px)]">
          <BackLink href="/directory" dark>
            ← Back to the index
          </BackLink>
          <div className="mt-6.5 flex flex-wrap items-center gap-[clamp(20px,3vw,36px)]">
            <Avatar
              id={provider.id}
              name={provider.name}
              size="clamp(88px, 12vw, 124px)"
              fontSize="clamp(32px, 4.5vw, 46px)"
              onDark
            />
            <div className="min-w-0 flex-[1_1_320px]">
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <span className="text-[10.5px] uppercase tracking-[0.22em] text-amber">
                  {categoryLabel(provider.category)}
                </span>
                {isVerified(provider) && <VerifiedMark onDark />}
              </div>
              <h1 className="font-heading text-[clamp(32px,5vw,58px)] leading-[1.05] font-light tracking-[-0.02em] text-white">
                {provider.name}
              </h1>
              <p className="mt-3 text-[clamp(15px,1.5vw,18px)] text-sage-pale">
                {metaLine(provider)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {styleLabels(provider.styles).map((style) => (
                  <TagHero key={style}>{style}</TagHero>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="shell shell-inset flex flex-wrap items-start gap-[clamp(24px,4vw,52px)] pt-[clamp(32px,5vw,60px)] pb-[clamp(48px,7vw,90px)]">
        {/* Main column */}
        <main className="flex min-w-0 flex-[3_1_440px] flex-col gap-[clamp(32px,4vw,52px)]">
          <div className="rounded-[18px] bg-mint p-[clamp(24px,3.4vw,44px)]">
            <p className="mb-4.5 text-[10.5px] uppercase tracking-[0.24em] text-leaf">
              {copy.philosophyLabel}
            </p>
            <blockquote className="font-heading text-[clamp(21px,2.5vw,30px)] leading-[1.42] font-light text-forest text-pretty">
              “{provider.philosophy}”
            </blockquote>
            <p className="mt-5.5 text-[15px] leading-[1.75] text-body text-pretty">
              {provider.bio}
            </p>
          </div>

          <section>
            <h2 className="display-4 mb-5.5">{copy.scheduleTitle}</h2>
            <div className="stack-table">
              {provider.schedule.map((row, i) => (
                <div key={i} className="stack-row">
                  <span className="flex-[0_0_104px] text-[12px] uppercase tracking-[0.16em] text-leaf">
                    {row.day}
                  </span>
                  <span className="flex-none text-[15px] font-medium text-forest">
                    {row.time}
                  </span>
                  <span className="flex-[1_1_180px] text-[14.5px] text-body">{row.what}</span>
                  <span className="text-[13px] text-faint">{row.where}</span>
                </div>
              ))}
            </div>
          </section>

          {bookable && slots.length > 0 && (
            <section id="classes">
              <h2 className="display-4 mb-2">{copy.classesTitle}</h2>
              <p className="mb-5.5 text-[15px] text-muted">
                Live availability. Places are held for ten minutes while you pay.
              </p>
              <div className="flex flex-col gap-2.5">
                {slots.map((slot) => {
                  const left = Math.max(0, slot.capacity - slot.booked);
                  const full = left === 0;
                  const capacityColor = full
                    ? "text-faint"
                    : left <= 3
                      ? "text-orange"
                      : "text-leaf";
                  return (
                    <CardFlat
                      key={slot.id}
                      className="flex flex-wrap items-center gap-x-4.5 gap-y-3 p-4.5"
                    >
                      <div className="min-w-0 flex-[1_1_200px]">
                        <p className="text-[15.5px] font-medium text-forest">{slot.what}</p>
                        <p className="mt-1.25 text-[13px] text-muted">
                          {slot.day} · {slot.time} · {slot.where}
                        </p>
                      </div>
                      <span className={`flex-none text-[13px] ${capacityColor}`}>
                        {full ? "Full" : `${left} of ${slot.capacity} left`}
                      </span>
                      <span className="flex-none text-[15px] font-medium text-forest">
                        {slot.price ? formatMoney(slot.price) : "Donation"}
                      </span>
                      {full ? (
                        <span className="flex-none rounded-full bg-disabled px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.16em] text-faint">
                          Full
                        </span>
                      ) : (
                        <ButtonLink
                          href={`/book/${provider.slug}?slot=${slot.id}`}
                          tone="forest"
                          className="flex-none px-5 py-3 text-[11.5px] tracking-[0.16em]"
                        >
                          Book
                        </ButtonLink>
                      )}
                    </CardFlat>
                  );
                })}
              </div>
            </section>
          )}

          {!bookable && (
            <section id="contact">
              <h2 className="display-4 mb-2">{copy.enquireLabel}</h2>
              {/* BKG-20: the provider's own contact details are shown directly —
                  contact masking never applies here (MSG-2). */}
              <p className="mb-5.5 text-[15px] leading-relaxed text-muted">
                {provider.contactEmail && (
                  <>
                    Email:{" "}
                    <a href={`mailto:${provider.contactEmail}`} className="underline">
                      {provider.contactEmail}
                    </a>
                    {provider.website && " · "}
                  </>
                )}
                {provider.website && (
                  <a href={provider.website} className="underline" rel="nofollow">
                    Website
                  </a>
                )}
              </p>
              <ContactForm providerSlug={provider.slug} providerName={provider.name} />
            </section>
          )}

          <section>
            <h2 className="display-4 mb-5.5">{copy.reviewsTitle}</h2>
            <div className="flex flex-col gap-3.5">
              {provider.reviews.map((review, i) => (
                <CardFlat key={i} className="p-5.5">
                  <p className="text-[15.5px] leading-[1.7] text-body text-pretty">
                    “{review.text}”
                  </p>
                  <p className="mt-3.5 text-[12.5px] text-faint">
                    {review.author} · {review.when}
                  </p>
                  <div className="mt-3">
                    <ReportForm targetType="review" targetId={`${provider.id}:review:${i}`} />
                  </div>
                </CardFlat>
              ))}
            </div>
            <p className="mt-4.5 text-[13px] text-faint">
              Showing {provider.reviews.length} of {provider.reviewCount} reviews.
            </p>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="sticky-side flex w-full min-w-62.5 flex-[1_1_270px] flex-col gap-4.5">
          <div className="flex flex-col gap-4.5 rounded-[18px] border border-mint-200 p-6">
            <ButtonLink
              href={bookable ? "#classes" : "#contact"}
              tone="primary"
              className="w-full px-4 py-4"
            >
              {bookable ? copy.classesTitle : copy.enquireLabel}
            </ButtonLink>
            <ShareButton title={provider.name} text={provider.tagline} />

            <dl className="flex flex-col gap-3 border-t border-mint pt-4.5">
              {provider.facts.map((fact) => (
                <div key={fact.label} className="flex justify-between gap-3">
                  <dt className="text-[13px] text-faint">{fact.label}</dt>
                  <dd className="text-right text-[13.5px] text-forest">{fact.value}</dd>
                </div>
              ))}
              {priceDisplay && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[13px] text-faint">
                    {priceIsIndicative ? "Typical price" : "Price"}
                  </dt>
                  <dd className="text-right text-[13.5px] text-forest">{priceDisplay}</dd>
                </div>
              )}
            </dl>
            {priceIsIndicative && (
              // LST-14: labelled as an indicative range, never a transaction value.
              <p className="text-[12px] leading-relaxed text-faint">
                Indicative range set by the provider, subject to change — confirm directly
                with them.
              </p>
            )}

            {provider.socials.length > 0 && (
              <div className="border-t border-mint pt-4.5">
                <SectionLabel className="mb-3">Elsewhere</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {provider.socials.map((social) => (
                    <span
                      key={social}
                      className="rounded-full border border-mint-200 px-3.25 py-2 text-[12px] tracking-[0.1em] text-leaf"
                    >
                      {social}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PRO-13: the neutral one-liner is the ONLY expression of the
              difference — identical card styling either way. */}
          <div className="rounded-[18px] border border-mint-200 p-5.5">
            <SectionLabel className="mb-2.5">How booking works</SectionLabel>
            <p className="text-[13px] leading-relaxed text-body">
              {bookable
                ? `Book and pay on The Yoga Universe — your place is confirmed instantly and ${provider.name} is notified.`
                : `You book directly with ${provider.name} — their contact details are on this page, and they confirm your place with you.`}{" "}
              <Link href="/help/how-booking-works" className="underline">
                Learn more
              </Link>
            </p>
          </div>

          {provider.verificationTier === "registry_verified" && (
            <div className="rounded-[18px] border border-mint-200 p-5.5">
              <SectionLabel className="mb-2.5">Verification</SectionLabel>
              <p className="text-[13px] leading-relaxed text-body">
                We have checked this provider&apos;s certification or accreditation against
                an external registry. Registration is a voluntary registry listing, not a
                licence or state certification.{" "}
                <Link href="/help/verification" className="underline">
                  How verification works
                </Link>
              </p>
            </div>
          )}

          <div className="rounded-[18px] bg-mint p-5.5">
            <SectionLabel className="mb-2.5">Where</SectionLabel>
            <p className="text-[15px] leading-[1.65] text-forest">{provider.address}</p>
          </div>

          {provider.provenance === "seeded" && !provider.onlineOnly && (
            <p className="text-center text-[13px] text-faint">
              Is this you?{" "}
              <Link href={`/claim/${provider.slug}`} className="underline">
                Claim this page
              </Link>{" "}
              ·{" "}
              <Link href="/legal/removal" className="underline">
                Request removal
              </Link>
            </p>
          )}
          <div className="text-center">
            <ReportForm targetType="provider" targetId={provider.id} />
          </div>
        </aside>
      </div>
    </>
  );
}
