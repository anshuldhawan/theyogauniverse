/**
 * BLG §2 — editorial content model. Article is the base type; format is a
 * property, not a subclass (BLG-1). Every Article belongs to exactly one
 * ContentCluster (BLG-2) and separates Author from Reviewer (BLG-3).
 */

export type ArticleFormat =
  | "pillar"
  | "cluster"
  | "comparison"
  | "how-to"
  | "explainer"
  | "data-study"
  | "news"
  | "interview";

/** BLG-18 workflow states. Transitions are audit-logged in production. */
export type ArticleState =
  | "brief"
  | "drafting"
  | "editing"
  | "expert_review"
  | "seo_check"
  | "legal_check"
  | "scheduled"
  | "published"
  | "in_review"
  | "updated"
  | "retired";

/** BLG-22 two-tier reviewer standard. */
export type ReviewTier = "none" | "practice" | "clinical";

export type CredentialTier = "practice" | "clinical";

export interface EditorialCredential {
  label: string; // e.g. "RYT-500", "Physiotherapist (DPT)"
  tier: CredentialTier;
  issuer: string;
}

/** BLG-30/61 — author profiles are pages of personal data about named people. */
export interface EditorialAuthor {
  slug: string;
  name: string;
  role: string;
  credentials: EditorialCredential[];
  yearsPractice: number;
  bio: string;
  expertise: string[];
  /** BLG-30: sameAs to authoritative external profiles. */
  sameAs: string[];
  /** BLG-29: platform teacher cross-link, when the author teaches on The Yoga Universe. */
  teacherSlug: string | null;
  /** BLG-61: departed authors keep bylines but display as former contributors. */
  state: "active" | "former";
}

/** BLG-7/8 — pillar-and-cluster, never a chronological feed. */
export interface ContentCluster {
  id: string;
  name: string;
  description: string;
  pillarSlug: string;
}

/** BLG-5 — structured sources, rendered as a visible References block. */
export interface ArticleSource {
  url: string;
  publication: string;
  author: string;
  publishedYear: number;
  dateAccessed: string; // ISO date
  claim: string; // the specific claim this source supports
  /** BLG-59: snapshot so a dead link doesn't silently undermine a live claim. */
  archiveUrl: string | null;
}

/** BLG-39 — individually fragment-addressable Q&A. */
export interface FAQItem {
  id: string; // fragment id
  question: string;
  /** 40–80 self-contained words; carries its own qualifier if health-related. */
  answer: string;
  health: boolean;
}

export interface ComparisonTable {
  headers: string[];
  rows: string[][];
}

/**
 * One H2 section of the Appendix-A template. Headings are question-shaped
 * (BLG-37); the first sentence of the first paragraph answers the heading.
 * Paragraphs may carry inline links as [anchor](/path) — editor-approved,
 * never auto-inserted (BLG-25).
 */
export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  /** BLG-38: tables for every comparison. */
  table?: ComparisonTable;
  list?: { ordered: boolean; items: string[] };
  /** BLG-47a inline qualifier, rendered inside the section beside the claim. */
  qualifier?: string;
}

/** BLG-47a placement variants with approved copy (see disclaimers.ts). */
export type DisclaimerVariant = "none" | "standard" | "high-risk";

export interface Article {
  /** BLG-11a: one slug pool across pillars and posts; `topics` reserved. */
  slug: string;
  title: string;
  format: ArticleFormat;
  clusterId: string;
  state: ArticleState;
  authorSlug: string;
  reviewerSlug: string | null;
  /** BLG-22: which reviewer tier the content requires. */
  reviewTier: ReviewTier;
  /** BLG-35: 40–60 words, self-contained, first thing on the page. */
  answerBlock: string;
  /** BLG-47a: drives disclaimer presence and copy. */
  disclaimer: DisclaimerVariant;
  excerpt: string;
  minutes: number;
  tint: string;
  /** Taxonomy term slugs this article covers (TopicEntity[], LST-12). */
  topics: string[];
  sections: ArticleSection[];
  faqs: FAQItem[];
  sources: ArticleSource[];
  /**
   * "Related on the platform" block. The gate (BLG-21.6) requires ≥3 internal
   * links total (body + related) with ≥1 commercial.
   */
  related: { href: string; anchor: string }[];
  /** BLG-4: dateModified only moves on substantive change (BLG-63). */
  datePublished: string;
  dateModified: string;
  dateReviewed: string | null;
  /** BLG-24: 6 months for fast-moving topics, 12 for evergreen. */
  nextReviewDue: string;
  /** BLG-65: production provenance. */
  aiAssisted: boolean;
}
