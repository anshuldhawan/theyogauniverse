import type { Metadata } from "next";
import Link from "next/link";
import { Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Trust, safety & community guidelines",
  description:
    "How The Yoga Universe handles safety reports, professional misconduct, moderation, suspension and appeals.",
  alternates: { canonical: "/legal/trust-safety" },
};

const GUIDELINES = [
  ["Be truthful", "Do not misrepresent identity, credentials, affiliations, prices or availability."],
  ["Keep people safe", "No harassment, exploitation, sexual misconduct, hate, threats or unsafe instruction."],
  ["Protect minors", "Providers offering children’s classes must hold the checks required where they operate."],
  ["Use payments safely", "Never solicit passwords, verification codes, crypto, gift cards or undisclosed off-platform payments."],
  ["Review honestly", "Reviews must describe a completed booking. Incentivised, coordinated or provider-authored reviews are prohibited."],
] as const;

export default function TrustSafetyPolicyPage() {
  return (
    <div className="shell-1100 page-y">
      <Eyebrow className="mb-3">Trust &amp; Safety</Eyebrow>
      <h1 className="display-1">A safer, more accountable yoga index</h1>
      <p className="mt-5 max-w-3xl text-[17px] leading-[1.75] text-muted">
        These rules apply equally to bookable and advertising-only providers. Reports are assessed
        on evidence, urgency and risk—not commercial status. We preserve allegations securely, use
        neutral language, and avoid publishing unverified claims.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {GUIDELINES.map(([title, body]) => (
          <Card key={title} className="p-6">
            <h2 className="heading-card text-xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </Card>
        ))}
      </section>

      <section className="mt-12 max-w-3xl space-y-5">
        <h2 className="display-4">How reports are handled</h2>
        <p className="leading-relaxed text-body">
          Immediate safety and safeguarding concerns receive priority triage. We may temporarily
          suspend a profile while credible, high-risk allegations are assessed. Professional
          misconduct cases receive legal review and defamation-aware handling. Evidence is restricted
          to reviewers who need it.
        </p>
        <h2 className="display-4">Suspension and appeal</h2>
        <p className="leading-relaxed text-body">
          Suspension or delisting requires a recorded reason, actor and evidence trail. The affected
          provider may submit a statement and evidence for review by a different decision-maker.
          Successful appeals restore the profile and remain in the private audit history.
        </p>
        <h2 className="display-4">Report or correct a listing</h2>
        <p className="leading-relaxed text-body">
          Use “Report this provider” on any profile for safety, impersonation, misconduct, scams or
          incorrect/closed information. To remove your own seeded profile, use the preserved{" "}
          <Link href="/legal/removal" className="underline">removal flow</Link>; it does not require an
          account.
        </p>
      </section>
    </div>
  );
}
