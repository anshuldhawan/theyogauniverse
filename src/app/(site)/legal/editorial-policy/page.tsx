/**
 * BLG-46 (AI-assistance disclosure) + BLG-48/48a (corrections policy and
 * public log). Linked from every article footer.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { authors } from "@/lib/editorial/store";

export const metadata: Metadata = {
  title: "Editorial policy",
  description:
    "How The Yoga Universe's guides are written, reviewed and corrected: named authors, tiered expert review, structured sources, AI-assistance disclosure and a public corrections log.",
  alternates: { canonical: "/legal/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Legal &amp; editorial</Eyebrow>
      <h1 className="display-2">Editorial policy</h1>

      <div className="prose-editorial mt-8">
        <section>
          <h2>Who writes and reviews our guides</h2>
          <p>
            Every article is attributed to a named human author with a public profile — never a
            pen name, an AI persona, or a generic editorial team. Articles that make health,
            safety or technique claims carry a second name: a reviewer whose credentials match
            the claims. Practice-instruction content is reviewed by an experienced, registry-
            credentialed teacher; medical, therapeutic and physiological claims are reviewed by
            a licensed clinician. The review date appears on the article.
          </p>
          <ul>
            {authors().map((author) => (
              <li key={author.slug}>
                <Link href={`/authors/${author.slug}`}>{author.name}</Link>{" "}
                — {author.role}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Sourcing</h2>
          <p>
            Health and safety claims cite peer-reviewed research, clinical guidelines or
            recognised institutional sources, listed in a References section on the article
            with the specific claim each source supports. Traditional and philosophical
            content cites recognised lineage sources. If we can&apos;t source a claim, we don&apos;t
            publish it.
          </p>
        </section>

        <section>
          <h2>AI assistance</h2>
          <p>
            We use AI tools in parts of our editorial process — research support, drafting
            assistance and consistency checks. No article is published without human review,
            editing and fact-checking by the named author, who is accountable for everything
            under their byline. Expert review, where required, is never performed by AI.
            Articles state their production provenance in the footer.
          </p>
        </section>

        <section>
          <h2>Medical content</h2>
          <p>
            Our guides are general information, not medical advice. Content touching health
            topics carries a disclaimer and inline qualifiers beside specific claims, is
            reviewed by a clinician, and is re-reviewed on a schedule shown on the article
            (&ldquo;next scheduled review&rdquo;). We describe evidence honestly, including
            where it is early, mixed or absent.
          </p>
        </section>

        <section>
          <h2>Commercial independence</h2>
          <p>
            The blog contains no affiliate links, no sponsored content and no paid placements.
            Guides link to teachers, studios, retreats and city pages on The Yoga Universe where that
            genuinely helps the reader act on what they learned — those links are editorial
            choices, never sold. Providers cannot pay to appear in, or influence, editorial
            content.
          </p>
        </section>

        <section id="corrections" className="scroll-mt-24">
          <h2>Corrections</h2>
          <p>
            When we get something factually wrong, we correct the article, note the correction
            here, and — for health content — send it back to its expert reviewer. Corrections
            are never silent: substantive changes move the article&apos;s &ldquo;updated&rdquo;
            date, and factual errors are logged below. Spot an error? Email{" "}
            <a href="mailto:editorial@theyogauniverse.example">editorial@theyogauniverse.example</a>.
          </p>
          <p className="rounded-[14px] border border-mint-200 bg-mint p-4.5 text-[14px]">
            No corrections have been required since the guide library launched (July 2026).
            This log will list each one: the article, what was wrong, what changed, and when.
          </p>
        </section>
      </div>
    </div>
  );
}
