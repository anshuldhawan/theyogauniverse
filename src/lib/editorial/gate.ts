/**
 * BLG-21 / Appendix B — the machine-enforced publish gate. Runs in CI over
 * every article in `published` state; any error fails the build. There is no
 * manual override: content that fails does not ship (scaled-content-abuse
 * defence, BLG-9).
 *
 * Checks 7 (corpus similarity) and 13 (anchor distribution) are advisory;
 * CWV and axe-core synthetic runs (Appendix B items 9/10) execute against
 * the built app in CI, not here — this module covers everything checkable
 * from content alone.
 */

import { DISCLAIMER_COPY, detectHighRiskPhrases } from "./disclaimers";
import { anchorDistributionWarnings, extractInternalLinks, isCommercialPath } from "./linking";
import type {
  Article,
  ContentCluster,
  CredentialTier,
  EditorialAuthor,
} from "./types";

export interface GateContext {
  articles: Article[];
  clusters: ContentCluster[];
  authors: EditorialAuthor[];
}

export interface GateResult {
  slug: string;
  errors: string[];
  warnings: string[];
}

/**
 * BLG-22 clinical-tier phrase list: claims in these areas need a clinical
 * reviewer, not a practice-tier one. Narrower than HIGH_RISK_PHRASES, which
 * gates disclaimers.
 */
const CLINICAL_PHRASES = [
  "pregnan",
  "prenatal",
  "postnatal",
  "blood pressure",
  "cardiovascular",
  "epilepsy",
  "psychiatric",
  "mental health",
  "depression",
  "anxiety",
  "medication",
  "rehabilitation",
  "hyperventilation",
  "fertility",
];

const RESERVED_SLUGS = new Set(["topics", "authors", "feed", "rss"]);
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function fullText(article: Article): string {
  return [
    article.title,
    article.answerBlock,
    ...article.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...article.faqs.flatMap((f) => [f.question, f.answer]),
  ].join("\n");
}

function tierRank(tier: CredentialTier | "none"): number {
  return tier === "clinical" ? 2 : tier === "practice" ? 1 : 0;
}

function bestTierOf(author: EditorialAuthor): CredentialTier | "none" {
  if (author.credentials.some((c) => c.tier === "clinical")) return "clinical";
  if (author.credentials.some((c) => c.tier === "practice")) return "practice";
  return "none";
}

/** Cheap corpus-similarity proxy: shingled token Jaccard (Appendix B item 7). */
export function similarityOf(a: string, b: string): number {
  const shingles = (text: string) => {
    const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    const set = new Set<string>();
    for (let i = 0; i < tokens.length - 2; i++) {
      set.add(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
    }
    return set;
  };
  const sa = shingles(a);
  const sb = shingles(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let intersection = 0;
  for (const s of sa) if (sb.has(s)) intersection++;
  return intersection / (sa.size + sb.size - intersection);
}

export function runGate(article: Article, ctx: GateContext): GateResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const text = fullText(article);

  // 1. Cluster assigned; cluster and pillar live.
  const cluster = ctx.clusters.find((c) => c.id === article.clusterId);
  if (!cluster) {
    errors.push(`cluster: "${article.clusterId}" does not exist (BLG-2)`);
  } else if (article.slug !== cluster.pillarSlug) {
    const pillar = ctx.articles.find(
      (a) => a.slug === cluster.pillarSlug && a.state === "published",
    );
    if (!pillar) errors.push(`cluster: pillar "${cluster.pillarSlug}" is not published (BLG-8)`);
  }

  // 2. Author exists with a fully populated profile (BLG-20/30).
  const author = ctx.authors.find((a) => a.slug === article.authorSlug);
  if (!author) {
    errors.push(`author: "${article.authorSlug}" has no profile (BLG-20)`);
  } else if (author.bio.length < 100 || author.credentials.length === 0 || author.expertise.length === 0) {
    errors.push(`author: profile for "${author.slug}" is not fully populated (BLG-30)`);
  }

  // 3. Reviewer tier matches the claims made (BLG-22).
  const clinicalHits = CLINICAL_PHRASES.filter((p) => text.toLowerCase().includes(p));
  const requiredTier: CredentialTier | "none" =
    clinicalHits.length > 0 ? "clinical" : article.reviewTier === "none" ? "none" : article.reviewTier;
  if (tierRank(article.reviewTier) < tierRank(requiredTier)) {
    errors.push(
      `reviewer: clinical-area claims (${clinicalHits.slice(0, 3).join(", ")}) require reviewTier "clinical" (BLG-22)`,
    );
  }
  if (article.reviewTier !== "none") {
    const reviewer = ctx.authors.find((a) => a.slug === article.reviewerSlug);
    if (!reviewer) {
      errors.push(`reviewer: required (tier "${article.reviewTier}") but none assigned (BLG-22)`);
    } else if (tierRank(bestTierOf(reviewer)) < tierRank(article.reviewTier)) {
      errors.push(
        `reviewer: "${reviewer.slug}" lacks a ${article.reviewTier}-tier credential (BLG-22)`,
      );
    }
    if (!article.dateReviewed) {
      errors.push("reviewer: reviewed article missing dateReviewed (BLG-32)");
    }
  }

  // 4. Answer block present, 40–60 words (BLG-35). The template renders it
  //    first, satisfying the BLG-64 first-800-characters rule structurally.
  const answerWords = wordCount(article.answerBlock);
  if (answerWords < 40 || answerWords > 60) {
    errors.push(`answer block: ${answerWords} words — must be 40–60 (BLG-35)`);
  }

  // 5. ≥3 structured sources with required fields (BLG-5/33).
  const validSources = article.sources.filter(
    (s) => s.url && s.publication && s.author && s.publishedYear && s.dateAccessed && s.claim,
  );
  if (validSources.length < 3) {
    errors.push(`sources: ${validSources.length} valid — need ≥3 with all fields (BLG-33)`);
  }

  // 6. ≥3 internal links, ≥1 to a commercial page (BLG-26).
  const links = extractInternalLinks(article);
  if (links.length < 3) {
    errors.push(`links: ${links.length} internal — need ≥3 (BLG-26)`);
  }
  if (!links.some((l) => isCommercialPath(l.href))) {
    errors.push("links: no commercial marketplace link (city hub, style page or profile) (BLG-26)");
  }

  // 7. Corpus similarity (advisory proxy for the production checker).
  const body = article.sections.flatMap((s) => s.paragraphs).join("\n");
  for (const other of ctx.articles) {
    if (other.slug === article.slug || other.state !== "published") continue;
    const otherBody = other.sections.flatMap((s) => s.paragraphs).join("\n");
    const score = similarityOf(body, otherBody);
    if (score > 0.5) {
      errors.push(`similarity: ${(score * 100).toFixed(0)}% overlap with "${other.slug}" (BLG-9)`);
    } else if (score > 0.3) {
      warnings.push(`similarity: ${(score * 100).toFixed(0)}% overlap with "${other.slug}"`);
    }
  }

  // 8. Slug rules (BLG-11a/13/14).
  if (!SLUG_PATTERN.test(article.slug)) {
    errors.push(`slug: "${article.slug}" is not a valid lowercase-hyphen slug (BLG-13)`);
  }
  if (RESERVED_SLUGS.has(article.slug)) {
    errors.push(`slug: "${article.slug}" is reserved (BLG-11a)`);
  }
  if (ctx.articles.some((a) => a !== article && a.slug === article.slug)) {
    errors.push(`slug: "${article.slug}" collides within the shared namespace (BLG-11a)`);
  }

  // 9. Question-shaped headings (BLG-37) — advisory.
  for (const section of article.sections) {
    if (!section.heading.trim().endsWith("?")) {
      warnings.push(`heading: "${section.heading}" is not question-shaped (BLG-37)`);
    }
  }

  // 10. Dates coherent; nextReviewDue set (BLG-4/24).
  if (!article.datePublished || !article.dateModified || !article.nextReviewDue) {
    errors.push("dates: datePublished, dateModified and nextReviewDue are required (BLG-4/24)");
  } else if (article.dateModified < article.datePublished) {
    errors.push("dates: dateModified precedes datePublished (BLG-4)");
  }

  // 11/12. Disclaimer presence + inline placement where high-risk phrases fire
  // (BLG-47a). FAQ answers flagged `health` must carry their own qualifier.
  const highRiskHits = detectHighRiskPhrases(text);
  if (highRiskHits.length > 0) {
    if (article.disclaimer === "none") {
      errors.push(
        `disclaimer: high-risk phrases (${highRiskHits.slice(0, 3).join(", ")}) require a disclaimer (BLG-47a)`,
      );
    }
    const flaggedSectionHasQualifier = article.sections.some(
      (s) =>
        detectHighRiskPhrases([s.heading, ...s.paragraphs].join("\n")).length > 0 &&
        Boolean(s.qualifier),
    );
    const flaggedInSections = article.sections.some(
      (s) => detectHighRiskPhrases([s.heading, ...s.paragraphs].join("\n")).length > 0,
    );
    if (flaggedInSections && !flaggedSectionHasQualifier) {
      errors.push("disclaimer: no inline qualifier in any section with high-risk phrases (BLG-47a)");
    }
  }
  for (const faq of article.faqs) {
    if (faq.health && !/consult your (doctor|physician|midwife)/i.test(faq.answer)) {
      errors.push(`faq: health answer "${faq.id}" missing consult-your-doctor qualifier (BLG-47a)`);
    }
  }

  // FAQ shape (BLG-39): fragment ids unique, answers self-contained length.
  const faqIds = new Set<string>();
  for (const faq of article.faqs) {
    if (faqIds.has(faq.id)) errors.push(`faq: duplicate fragment id "${faq.id}" (BLG-39)`);
    faqIds.add(faq.id);
    const words = wordCount(faq.answer);
    if (words < 30 || words > 90) {
      warnings.push(`faq: "${faq.id}" answer is ${words} words — aim for 40–80 (BLG-39)`);
    }
  }

  return { slug: article.slug, errors, warnings };
}

/** Gate the whole corpus; used by CI and the editorial tests. */
export function runGateOverCorpus(ctx: GateContext): {
  results: GateResult[];
  anchorWarnings: ReturnType<typeof anchorDistributionWarnings>;
} {
  const published = ctx.articles.filter((a) => a.state === "published");
  return {
    results: published.map((article) => runGate(article, ctx)),
    anchorWarnings: anchorDistributionWarnings(published),
  };
}

/** Approved copy is exported so templates can never drift from legal's text. */
export { DISCLAIMER_COPY };
