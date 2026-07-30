import { AUTHORS } from "@/data/editorial/authors";
import { CLUSTERS } from "@/data/editorial/clusters";
import { PILLARS } from "@/data/editorial/pillars";
import { POSTS } from "@/data/editorial/posts";
import type { Article, ContentCluster, EditorialAuthor } from "./types";

const ARTICLES: Article[] = [...PILLARS, ...POSTS];

/** Published only — draft/retired articles never reach a public surface. */
export function publishedArticles(): Article[] {
  return ARTICLES.filter((a) => a.state === "published");
}

export function allArticles(): Article[] {
  return ARTICLES;
}

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug && a.state === "published");
}

export function clusters(): ContentCluster[] {
  return CLUSTERS;
}

export function clusterById(id: string): ContentCluster | undefined {
  return CLUSTERS.find((c) => c.id === id);
}

export function pillarOf(clusterId: string): Article | undefined {
  const cluster = clusterById(clusterId);
  return cluster ? articleBySlug(cluster.pillarSlug) : undefined;
}

/** Supporting posts of a cluster, pillar excluded. */
export function clusterPosts(clusterId: string): Article[] {
  const cluster = clusterById(clusterId);
  return publishedArticles().filter(
    (a) => a.clusterId === clusterId && a.slug !== cluster?.pillarSlug,
  );
}

export function authors(): EditorialAuthor[] {
  return AUTHORS;
}

export function authorBySlug(slug: string): EditorialAuthor | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}

export function articlesByAuthor(authorSlug: string): {
  authored: Article[];
  reviewed: Article[];
} {
  const published = publishedArticles();
  return {
    authored: published.filter((a) => a.authorSlug === authorSlug),
    reviewed: published.filter((a) => a.reviewerSlug === authorSlug),
  };
}

/** BLG-29: posts authored or reviewed by a platform teacher. */
export function articlesByTeacherSlug(teacherSlug: string): Article[] {
  const author = AUTHORS.find((a) => a.teacherSlug === teacherSlug);
  if (!author) return [];
  const { authored, reviewed } = articlesByAuthor(author.slug);
  return [...new Set([...authored, ...reviewed])];
}

/** BLG-11: topic archive membership via TopicEntity bindings. */
export function articlesByTopic(topicSlug: string): Article[] {
  return publishedArticles().filter((a) => a.topics.includes(topicSlug));
}

/**
 * BLG-27 reverse surfacing: editorial for a city hub — articles that link to
 * the hub, topped up with the destination-cluster pillar. Overdue-for-review
 * articles are demoted to the back of the list (BLG-24).
 */
export function editorialForCity(country: string, citySlug: string, limit = 3): Article[] {
  const hubPath = `/${country}/${citySlug}/yoga`;
  const now = new Date();
  const linking = publishedArticles().filter((a) =>
    a.sections.some((s) => s.paragraphs.some((p) => p.includes(`](${hubPath})`))) ||
    a.related.some((r) => r.href === hubPath),
  );
  const pillar = pillarOf("city-destination-guides");
  const picks = [...new Set([...linking, ...(pillar ? [pillar] : [])])];
  return demoteOverdue(picks, now).slice(0, limit);
}

/** BLG-27: editorial for style-filtered directory views, via TopicEntities. */
export function editorialForStyles(styleSlugs: string[], limit = 3): Article[] {
  const now = new Date();
  const matches = publishedArticles().filter((a) =>
    a.topics.some((t) => styleSlugs.includes(t)),
  );
  return demoteOverdue(matches, now).slice(0, limit);
}

/** BLG-24: review-overdue articles lose internal-linking prominence. */
function demoteOverdue(articles: Article[], now: Date): Article[] {
  return [...articles].sort((a, b) => {
    const rank = (article: Article) => (reviewStatus(article, now) === "current" ? 0 : 1);
    return rank(a) - rank(b);
  });
}

/**
 * BLG-24: overdue-for-review articles are demoted in internal linking and,
 * six months past due, noindexed. Mirrors ING-9 freshness discipline.
 */
export function reviewStatus(
  article: Article,
  now: Date,
): "current" | "overdue" | "noindex" {
  const due = new Date(article.nextReviewDue).getTime();
  if (now.getTime() <= due) return "current";
  const sixMonthsMs = 183 * 86_400_000;
  return now.getTime() - due > sixMonthsMs ? "noindex" : "overdue";
}
