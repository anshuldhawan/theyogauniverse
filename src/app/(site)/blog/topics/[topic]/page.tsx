/**
 * BLG-11/15 — topic archives bind articles to taxonomy TopicEntities.
 * `noindex, follow` by default: crawl paths, not ranking pages. A topic
 * page earns index status only by graduating to curated content (not v1).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleCard } from "@/components/site/editorial";
import { Eyebrow } from "@/components/ui";
import { articlesByTopic, clusterById, publishedArticles } from "@/lib/editorial/store";
import { allStyleTerms } from "@/lib/taxonomy";

interface Props {
  params: Promise<{ topic: string }>;
}

export function generateStaticParams() {
  const used = new Set(publishedArticles().flatMap((a) => a.topics));
  return [...used].map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const term = allStyleTerms().find((t) => t.slug === topic);
  return {
    title: `${term?.label ?? topic} — guides`,
    robots: { index: false, follow: true },
    alternates: { canonical: `/blog/topics/${topic}` },
  };
}

export default async function TopicArchivePage({ params }: Props) {
  const { topic } = await params;
  const articles = articlesByTopic(topic);
  if (articles.length === 0) notFound();
  const term = allStyleTerms().find((t) => t.slug === topic);
  const label = term?.label ?? topic;

  return (
    <div className="shell-1100 page-y">
      <Eyebrow className="mb-3">Topic</Eyebrow>
      <h1 className="display-1">Guides that cover {label.toLowerCase()}</h1>
      <p className="mt-3.5 text-[16px] leading-[1.7] text-muted">
        Looking for classes instead?{" "}
        <Link href={`/directory?styles=${topic}`} className="underline">
          Browse {label.toLowerCase()} teachers and studios
        </Link>
        .
      </p>
      <div className="grid-fill-300 mt-10 gap-8">
        {articles.map((article) => (
          <ArticleCard
            key={article.slug}
            article={article}
            clusterName={clusterById(article.clusterId)?.name}
          />
        ))}
      </div>
    </div>
  );
}
