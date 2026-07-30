import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "How verification works",
  description:
    "What the verified marker means on The Yoga Universe: the three trust tiers, which registries we check, and what verification does not claim.",
};

/** CRD-6: public methodology page explaining what each verification state means. */
export default function VerificationPage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Help</Eyebrow>
      <h1 className="display-2">How verification works</h1>
      <div className="prose-editorial mt-7">
        <p>Every provider on The Yoga Universe sits in one of three tiers:</p>
        <div className="stack-table">
          <div className="block bg-white p-5">
            <h3>Registry-verified</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed">
              We checked the provider&apos;s certification or accreditation against an
              external registry — Yoga Alliance, Yoga Alliance Professionals, the British
              Wheel of Yoga, Yoga Australia, or an equivalent body — and re-check it
              periodically. These providers carry the verified marker.
            </p>
          </div>
          <div className="block bg-white p-5">
            <h3>Document-verified</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed">
              The provider uploaded a certificate that our team reviewed. Documents stay
              private; only the verification state is public.
            </p>
          </div>
          <div className="block bg-white p-5">
            <h3>Self-declared</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed">
              The provider stated their training and it has not been independently checked.
              Most newly listed providers start here.
            </p>
          </div>
        </div>
        <h2>What verification does not mean</h2>
        <p>
          Yoga teaching is not a licensed profession in most jurisdictions.
          Registry verification confirms membership of a voluntary registry —
          it is not a licence, a state certification or a guarantee of
          teaching quality, and we word it accordingly. Where a credential
          lapses, the marker is removed until it is renewed. Misrepresenting
          credentials is grounds for removal from the index.
        </p>
      </div>
    </div>
  );
}
