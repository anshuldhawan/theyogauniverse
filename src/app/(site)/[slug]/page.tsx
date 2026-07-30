import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, ButtonLink, SectionLabel, VerifiedMark } from "@/components/ui";
import { buyerContext } from "@/lib/buyer";
import { isVerified, providerView } from "@/lib/listing-view";
import { providerBySlug, slotsForProvider } from "@/lib/repo";
import { providerPath } from "@/lib/urls";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = providerBySlug(slug);
  if (!provider) return {};
  return {
    title: `${provider.name} — links`,
    description: provider.tagline.slice(0, 160),
    alternates: { canonical: providerPath(provider) },
    robots: { index: false, follow: true }, // canonical page is the full profile
  };
}

/**
 * PRO-7 — link-in-bio mode: a mobile-first, single-column variant of the
 * profile at /{slug}, built to be an Instagram/TikTok bio link. Prominent
 * book-or-enquire CTA, links, next sessions. Per MSG-2, the provider's own
 * website and social links are always permitted here.
 */
export default async function LinkInBioPage({ params }: Props) {
  const { slug } = await params;
  const provider = providerBySlug(slug);
  if (!provider) notFound();

  const buyer = await buyerContext();
  const view = providerView(provider, buyer);
  const bookable = view.transactability === "bookable";
  const nextSessions = provider.schedule.slice(0, 3);
  const slots = bookable ? slotsForProvider(provider.id).slice(0, 3) : [];

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col gap-3.5 px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <Avatar id={provider.id} name={provider.name} size={88} />
        <p className="mt-5 font-heading text-[32px] leading-tight font-light text-forest">
          {provider.name}
        </p>
        <p className="mt-1.5 text-[13.5px] text-muted">
          {provider.onlineOnly ? "Online, worldwide" : provider.cityName}
        </p>
        {isVerified(provider) && (
          <div className="mt-3">
            <VerifiedMark />
          </div>
        )}
        <p className="mt-4 text-[15px] leading-relaxed text-body text-pretty">
          {provider.tagline}
        </p>
      </div>

      <ButtonLink
        href={
          bookable ? `${providerPath(provider)}#classes` : `${providerPath(provider)}#contact`
        }
        tone={bookable ? "primary" : "forest"}
        className="mt-3 w-full"
      >
        {bookable ? "Book a class" : "Enquire"}
      </ButtonLink>
      <ButtonLink href={providerPath(provider)} tone="outline" className="w-full">
        Full profile
      </ButtonLink>
      {provider.website && (
        <a
          href={provider.website}
          className="block rounded-full border border-mint-200 py-4 text-center text-[12px] font-medium uppercase tracking-[0.18em] text-body hover:border-sage"
        >
          Website
        </a>
      )}

      <div className="mt-2 rounded-[14px] border border-mint-200 p-4.5">
        <SectionLabel className="mb-3">Next up</SectionLabel>
        <div className="flex flex-col gap-2">
          {(slots.length > 0 ? slots : null)?.map((slot) => (
            <p key={slot.id} className="text-[14.5px]">
              <span className="text-forest">{slot.what}</span>
              <span className="text-muted">
                {" "}
                — {slot.day}, {slot.time}
              </span>
            </p>
          )) ??
            nextSessions.map((row, i) => (
              <p key={i} className="text-[14.5px]">
                <span className="text-forest">{row.what}</span>
                <span className="text-muted">
                  {" "}
                  — {row.day}, {row.time}
                </span>
              </p>
            ))}
        </div>
      </div>

      <p className="mt-auto pt-6 text-center text-[12px] text-faint">
        Powered by{" "}
        <Link href="/" className="underline">
          The Yoga Universe
        </Link>
      </p>
    </div>
  );
}
