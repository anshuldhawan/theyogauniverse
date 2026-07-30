import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "How booking works",
  description:
    "Some providers on The Yoga Universe can be booked and paid on the site; with others you book directly. What each means for confirmation, payment and cancellation.",
};

/** The PRO-13 "learn more" destination — neutral, factual, no hierarchy. */
export default function HowBookingWorksPage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Help</Eyebrow>
      <h1 className="display-2">How booking works</h1>
      <div className="prose-editorial mt-7">
        <p>
          Every provider on The Yoga Universe is listed the same way: real schedule,
          verified credentials where they exist, honest reviews. The one thing
          that varies is how you book — and that depends on where the provider
          operates, not on how good they are.
        </p>
        <h2>Booking on The Yoga Universe</h2>
        <p>
          Where a listing shows a <strong>Book</strong> button, you pay on
          The Yoga Universe and your place is confirmed instantly. Payment is processed
          securely, your booking appears in your account, and the cancellation
          policy shown at checkout is the one that applies. If a class is
          cancelled by the provider, you are refunded automatically.
        </p>
        <h2>Booking directly</h2>
        <p>
          Where a listing shows an <strong>Enquire</strong> button, the
          provider takes bookings themselves. Their contact details, website
          and booking link are on their page — you arrange your place and pay
          with them, on their terms. The Yoga Universe takes no fee and is not part of
          the conversation. Prices shown on these listings are indicative
          ranges set by the provider; confirm the current price with them.
        </p>
        <h2>Which providers are which?</h2>
        <p>
          Booking on The Yoga Universe is currently available for providers operating in
          the United States. Everywhere else, listings connect you directly to
          the provider. This reflects where we can legally process payments —
          it says nothing about the quality of the teaching.
        </p>
      </div>
    </div>
  );
}
