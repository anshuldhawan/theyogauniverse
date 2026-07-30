import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How The Yoga Universe collects, uses and protects personal data.",
};

/**
 * COMP-1..COMP-6 placeholder pending counsel-reviewed policy. The section
 * headings mirror the commitments the platform is built to: GDPR/CCPA
 * rights, Art. 14 notice for indexed professionals, data minimisation.
 */
export default function PrivacyPage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Legal</Eyebrow>
      <h1 className="display-2">Privacy policy</h1>
      <div className="prose-editorial mt-7">
        <p className="rounded-[14px] bg-mint p-4.5 text-[14.5px] text-body">
          Draft pending counsel review — this page states the platform&apos;s working
          commitments, not final legal language.
        </p>
        <h2>What we collect</h2>
        <p>
          Account details you give us; booking and payment records where you book
          on The Yoga Universe (payment card data is handled by our payment processor, not
          stored by us); health notes you choose to share, encrypted and visible
          only to providers you book with.
        </p>
        <h2>Professionals in the index</h2>
        <p>
          We index publicly available professional information (name, business,
          schedule, credentials). If you are listed, we notify you where contact
          details exist, and you may claim, correct, or{" "}
          <Link href="/legal/removal">remove your listing</Link> at
          any time — removal is permanent and prevents re-listing.
        </p>
        <h2>Your rights</h2>
        <p>
          Access, export, correction and erasure requests are honoured under
          GDPR, UK GDPR and CCPA/CPRA. Erasure removes personal data while
          retaining transaction records we are legally required to keep.
        </p>
        <p>
          You can submit an account-free <Link href="/legal/privacy/requests">privacy request</Link>{" "}
          for access, correction, erasure, portability, objection, or sale/sharing opt-out.
          Requests are identity-verified and tracked against a 30-day operational deadline.
        </p>
        <h2>Cookies, analytics and Global Privacy Control</h2>
        <p>
          Necessary storage operates the service. Analytics and marketing technologies are
          blocked until you consent. A Global Privacy Control signal disables optional
          tracking and is treated as an opt-out of sale or sharing.
        </p>
        <h2>International transfers and Australia</h2>
        <p>
          Data may be processed outside your country by service providers supporting the
          platform. We document recipients, purposes and safeguards and assess reportable
          breaches. Final transfer language, EU representation and Australian privacy review
          remain external legal work and are not represented as completed.
        </p>
      </div>
    </div>
  );
}
