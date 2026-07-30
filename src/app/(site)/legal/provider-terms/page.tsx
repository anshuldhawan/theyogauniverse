import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Provider terms" };

export default function ProviderTermsPage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Legal</Eyebrow>
      <h1 className="display-2">Provider terms</h1>
      <div className="prose-editorial mt-7">
        <p className="rounded-[14px] bg-mint p-4 text-sm">
          Draft operational terms pending counsel review. Acceptance must be versioned at
          provider onboarding before these terms are relied on.
        </p>
        <h2>Bookable marketplace providers</h2>
        <p>
          You provide the service as an independent business. You must keep listing,
          availability, qualifications, cancellation terms, and trader identity accurate;
          honour confirmed bookings; and comply with applicable consumer and safety law.
          Platform commission and payment terms are shown before acceptance.
        </p>
        <h2>Insurance</h2>
        <p>
          Providers must maintain professional liability insurance appropriate to their
          services and location and keep evidence current. The platform does not insure a
          provider&apos;s teaching or replace their cover. Platform E&amp;O/cyber placement
          is an external risk task and is not represented here as complete.
        </p>
        <h2>Advertising-only providers</h2>
        <p>
          Advertising-only providers receive directory and direct-contact services only.
          We do not process their payments, take commission, confirm bookings, or join the
          provider/customer contract. They remain bound by identity, accuracy, content,
          conduct, privacy, notice-and-action, and removal rules.
        </p>
        <p>
          Practitioners are covered separately by the <Link href="/legal/terms">user terms</Link>.
        </p>
      </div>
    </div>
  );
}
