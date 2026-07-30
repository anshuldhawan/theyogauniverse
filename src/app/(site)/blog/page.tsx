/**
 * BLG-7/16 — the blog home is a pillar-and-cluster library, not a
 * chronological feed. Each cluster leads with its pillar and lists its
 * supporting posts; date-based navigation is deliberately absent.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard, formatDate } from "@/components/site/editorial";
import { Eyebrow, SectionLabel } from "@/components/ui";
import { clusterPosts, clusters, pillarOf } from "@/lib/editorial/store";

export const metadata: Metadata = {
  title: "Guides — honest writing about practice",
  description:
    "Expert-reviewed guides to yoga styles, breathwork, retreats, teacher training and starting a practice — organised by topic, written to be useful, not to sell.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="shell-1100 page-y">
      <Eyebrow className="mb-3">The blog</Eyebrow>
      <h1 className="display-1 mb-3.5">Writing about the practice</h1>
      <p className="mb-11 max-w-[60ch] text-[17px] leading-[1.7] text-muted">
        Plain, useful essays on styles, lineages, breathwork and what actually happens in a
        class — written with the people in the index.
      </p>

      <div className="flex flex-col gap-[clamp(40px,5vw,64px)]">
        {clusters().map((cluster) => {
          const pillar = pillarOf(cluster.id);
          const posts = clusterPosts(cluster.id);
          if (!pillar) return null;
          return (
            <section key={cluster.id}>
              <SectionLabel className="mb-5">{cluster.name}</SectionLabel>
              <div className="grid-fill-300 gap-8">
                <Link href={`/blog/${pillar.slug}`} className="flex flex-col gap-3">
                  <div
                    className="flex h-47.5 items-end rounded-[14px] p-4"
                    style={{ background: pillar.tint }}
                  >
                    <span className="rounded-full bg-white px-2.75 py-1.5 text-[10.5px] uppercase tracking-[0.2em] text-forest">
                      Start here
                    </span>
                  </div>
                  <h2 className="heading-card mt-1 text-[23px] leading-[1.25] text-pretty">
                    {pillar.title}
                  </h2>
                  <p className="text-[14.5px] leading-[1.65] text-muted">{pillar.excerpt}</p>
                  <span className="text-[12px] text-faint">
                    {pillar.minutes} min read · Updated {formatDate(pillar.dateModified)}
                  </span>
                </Link>
                {posts.map((post) => (
                  <ArticleCard key={post.slug} article={post} clusterName={cluster.name} />
                ))}
                {posts.length === 0 && (
                  <p className="self-center text-[14.5px] text-faint">
                    Supporting guides for this topic are in production.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
