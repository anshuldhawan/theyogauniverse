import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BookingFlow, type BookableSlot } from "@/components/site/BookingFlow";
import { BackLink } from "@/components/ui";
import { buyerContext } from "@/lib/buyer";
import { providerView } from "@/lib/listing-view";
import { formatMoney } from "@/lib/money";
import { organisationById, primaryListingOf, providerBySlug, slotsForProvider } from "@/lib/repo";
import { travelInsuranceReferral } from "@/lib/travel-insurance";
import { providerPath } from "@/lib/urls";
import { WAIVER_TEXT } from "@/lib/waivers";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ slot?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = providerBySlug(slug);
  return { title: provider ? `Book — ${provider.name}` : "Book", robots: { index: false } };
}

export default async function BookPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { slot: initialSlotId } = await searchParams;
  const provider = providerBySlug(slug);
  if (!provider) notFound();

  // Never render a booking flow we can't honour (DM-7): advertising-only
  // providers redirect to their profile's contact section.
  const buyer = await buyerContext();
  const view = providerView(provider, buyer);
  if (view.transactability !== "bookable") {
    redirect(`${providerPath(provider)}#contact`);
  }
  const listing = primaryListingOf(provider.id);
  const organisation = listing ? organisationById(listing.organisationId) : undefined;
  const insuranceUrl =
    listing && organisation
      ? travelInsuranceReferral({ listing, organisation, buyer })
      : null;

  const slots: BookableSlot[] = slotsForProvider(provider.id).map((slot) => ({
    id: slot.id,
    day: slot.day,
    time: slot.time,
    what: slot.what,
    where: slot.where,
    placesLeft: slot.capacity - slot.booked,
    priceLabel: slot.price ? formatMoney(slot.price) : "Donation",
  }));

  return (
    <div className="shell-760 page-y">
      <BackLink href={providerPath(provider)} className="mb-7 inline-block">
        ← Back to {provider.name}
      </BackLink>
      <BookingFlow
        providerSlug={provider.slug}
        providerName={provider.name}
        backHref={providerPath(provider)}
        slots={slots}
        initialSlotId={initialSlotId}
        waiverText={WAIVER_TEXT}
        travelInsuranceUrl={insuranceUrl}
      />
    </div>
  );
}
