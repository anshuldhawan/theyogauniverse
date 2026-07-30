import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { PushNotificationControl } from "@/components/PwaControls";
import { ShareButton } from "@/components/site/ShareButton";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { finalizeCheckout } from "@/lib/booking";
import { formatMoney } from "@/lib/money";
import { bookingByReference, providerBySlug, slotById } from "@/lib/repo";
import { providerPath } from "@/lib/urls";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false },
};

interface Props {
  params: Promise<{ reference: string }>;
}

export default async function BookingConfirmationPage({ params }: Props) {
  const { reference } = await params;
  let booking = bookingByReference(reference.toUpperCase());
  if (!booking) notFound();

  // Redirect-based payment methods land here straight from Stripe with the
  // booking still pending; verify the intent and settle before rendering.
  if (booking.state === "pending" && booking.paymentIntentRef) {
    await finalizeCheckout(booking.reference);
    booking = bookingByReference(booking.reference) ?? booking;
  }

  // Seed provider ids double as slugs.
  const provider = providerBySlug(booking.providerId);
  const slot = slotById(booking.slotId);
  const pendingPayment = booking.state === "pending";
  const qrDataUrl = await QRCode.toDataURL(
    `${siteUrl()}/booking/${encodeURIComponent(booking.reference)}`,
    { margin: 1, width: 160, errorCorrectionLevel: "M" },
  );

  return (
    <div className="shell-760 page-y">
      <div className="rounded-[18px] border border-sage bg-mint p-[clamp(28px,4vw,48px)]">
        <Eyebrow className="mb-3.5">
          Booking {booking.state.replace(/_/g, " ")}
        </Eyebrow>
        <h1 className="display-2 mb-3">
          {pendingPayment ? "Almost there." : `You have a place, ${booking.guestName}.`}
        </h1>
        <p className="text-[16px] leading-[1.7] text-body">
          {pendingPayment
            ? "Your payment is still processing. This page updates once it clears — refresh in a moment."
            : `A confirmation email is on its way to ${booking.guestEmail}. Show your check-in code at the door.`}
        </p>

        <div className="mt-7 flex flex-wrap items-start justify-between gap-6 rounded-[14px] bg-white p-5.5">
          <div>
            <p className="text-[16px] font-medium text-forest">{slot?.what}</p>
            <p className="mt-1.5 text-[13.5px] text-muted">
              {provider?.name} · {slot?.day} · {slot?.time}
            </p>
            <p className="text-[13.5px] text-muted">{slot?.where}</p>
            <p className="mt-3.5 text-[14.5px] text-body">
              {booking.price ? formatMoney(booking.price) : "Donation-based"} · booked by{" "}
              {booking.guestName}
            </p>
          </div>
          {/* WEB-6: check-in code shown at the door (QR wrapper in the PWA). */}
          <div className="rounded-[14px] bg-forest px-6 py-5 text-center">
            <p className="label text-sage">Check-in code</p>
            <Image
              src={qrDataUrl}
              alt={`QR check-in code for ${booking.reference}`}
              width={160}
              height={160}
              unoptimized
              className="mt-2 rounded bg-white"
            />
            <p className="mt-1.5 font-mono text-2xl font-bold tracking-wider text-white">
              {booking.reference}
            </p>
          </div>
        </div>

        <p className="mt-5 text-[13px] leading-relaxed text-faint">
          Cancellation is free until 12 hours before the class — that is the policy saved
          with this booking.
        </p>
        <PushNotificationControl bookingReference={booking.reference} />

        <div className="mt-8 flex flex-wrap gap-3.5">
          {provider && (
            <ButtonLink href={providerPath(provider)} tone="forest">
              Back to the listing
            </ButtonLink>
          )}
          <ButtonLink href="/directory" tone="outline">
            Find another class
          </ButtonLink>
          <ShareButton
            title={`Booking ${booking.reference}`}
            text={`${slot?.what ?? "Yoga booking"} with ${provider?.name ?? "The Yoga Universe"}`}
          />
        </div>
      </div>
    </div>
  );
}
