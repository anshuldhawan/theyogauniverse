import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms of use for The Yoga Universe index and marketplace.",
};

/** COMP-7 placeholder pending counsel-reviewed marketplace terms. */
export default function TermsPage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Legal</Eyebrow>
      <h1 className="display-2">Terms of service</h1>
      <div className="prose-editorial mt-7">
        <p className="rounded-[14px] bg-mint p-4.5 text-[14.5px] text-body">
          Draft pending counsel review — this page states the platform&apos;s working
          position, not final legal language.
        </p>
        <h2>The Yoga Universe is a marketplace</h2>
        <p>
          Providers listed on The Yoga Universe are independent businesses. Where you book
          and pay on The Yoga Universe, we process the transaction as the provider&apos;s
          commercial agent; the class, retreat or training is provided by them.
          Where you contact a provider directly, your arrangement — including
          payment, confirmation and cancellation — is entirely between you and
          them, on their terms.
        </p>
        <h2>Bookings made on The Yoga Universe</h2>
        <p>
          The price, cancellation policy and refund terms shown at checkout are
          the ones that apply to that booking. Provider cancellations are
          refunded in full automatically.
        </p>
        <h2>Reviews</h2>
        <p>
          Only verified attendees can review. We do not remove reviews for
          being negative; we remove them for violating content standards.
        </p>
        <h2>Separate provider terms</h2>
        <p>
          Providers, including advertising-only providers, accept a separate{" "}
          <Link href="/legal/provider-terms">provider agreement</Link>. The lighter
          advertising-only terms do not include payment or commission services.
        </p>
      </div>
    </div>
  );
}
