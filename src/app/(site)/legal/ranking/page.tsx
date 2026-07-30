import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { RANKING_CONFIG } from "@/lib/config/markets";

export const metadata: Metadata = { title: "How search ranking works" };

export default function RankingPage() {
  return (
    <div className="shell-760 page-y">
      <Eyebrow className="mb-3">Ranking transparency</Eyebrow>
      <h1 className="display-2">How search results are ordered</h1>
      <div className="prose-editorial mt-7">
        <p>
          Results combine query relevance (55%) and quality (45%). Quality uses
          verification, profile completeness/confidence, freshness, and verified-review
          history. For bookable listings it may also use booking conversion, response rate,
          and cancellation rate.
        </p>
        <h2>Commercial factors</h2>
        <p>
          We do not sell placement in v1. Advertising-only listings cannot be booked here
          and receive a {Math.round((1 - RANKING_CONFIG.advertisingOnlyMultiplier) * 100)}%
          score reduction. They are never filtered out solely for that reason, and missing
          booking signals are not treated as zero.
        </p>
        <h2>Current version</h2>
        <p>
          Ranking configuration {RANKING_CONFIG.version}. Material parameter changes will
          be reflected in this statement.
        </p>
        <p className="rounded-[14px] bg-mint p-4 text-sm">
          Disclosure wording remains subject to legal review before launch.
        </p>
      </div>
    </div>
  );
}
