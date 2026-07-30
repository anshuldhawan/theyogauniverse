import { describe, expect, it } from "vitest";
import { AUTHORS } from "@/data/editorial/authors";
import { CLUSTERS } from "@/data/editorial/clusters";
import { detectHighRiskPhrases } from "./disclaimers";
import { runGate, similarityOf, type GateContext } from "./gate";
import {
  anchorDistributionWarnings,
  extractInternalLinks,
  isCommercialPath,
  proposeEntityLinks,
} from "./linking";
import type { Article } from "./types";

/** A minimal article that passes every gate check. */
function validArticle(overrides: Partial<Article> = {}): Article {
  return {
    slug: "test-article",
    title: "What is a test article?",
    format: "explainer",
    clusterId: "practice-fundamentals",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: null,
    reviewTier: "none",
    answerBlock:
      "A test article exists to exercise the publish gate with realistic content and structure. " +
      "It carries an answer block of the correct length, three structured sources, three internal " +
      "links including one commercial destination, and clean dates, so every blocking check passes.",
    disclaimer: "none",
    excerpt: "A gate fixture.",
    minutes: 5,
    tint: "#a2d1a2",
    topics: ["hatha"],
    sections: [
      {
        heading: "Why does this section exist?",
        paragraphs: [
          "It exists to give the similarity and link checks something to chew on, including a [style link](/directory?styles=hatha) inline.",
        ],
      },
    ],
    faqs: [],
    sources: [1, 2, 3].map((n) => ({
      url: `https://example.org/source-${n}`,
      publication: "Example Journal",
      author: "Example Author",
      publishedYear: 2024,
      dateAccessed: "2026-07-25",
      claim: `Claim ${n}.`,
      archiveUrl: null,
    })),
    related: [
      { href: "/blog/how-to-start-yoga", anchor: "Starting yoga" },
      { href: "/help/verification", anchor: "Verification" },
    ],
    datePublished: "2026-07-01",
    dateModified: "2026-07-01",
    dateReviewed: null,
    nextReviewDue: "2027-07-01",
    aiAssisted: false,
    ...overrides,
  };
}

function contextWith(article: Article): GateContext {
  // A published pillar for the fixture's cluster keeps check 1 satisfied.
  const pillar = validArticle({
    slug: "how-to-start-yoga",
    title: "How do you start?",
    sections: [
      {
        heading: "Is this the pillar?",
        paragraphs: ["Entirely different pillar words so similarity stays low, with [a link](/directory)."],
      },
    ],
  });
  return { articles: [article, pillar], clusters: CLUSTERS, authors: AUTHORS };
}

describe("publish gate (BLG-21)", () => {
  it("passes a fully valid article", () => {
    const article = validArticle();
    const result = runGate(article, contextWith(article));
    expect(result.errors).toEqual([]);
  });

  it("fails when the cluster does not exist", () => {
    const article = validArticle({ clusterId: "nope" });
    const result = runGate(article, contextWith(article));
    expect(result.errors.some((e) => e.includes("cluster"))).toBe(true);
  });

  it("fails when the cluster pillar is not published", () => {
    const article = validArticle({ clusterId: "retreats" });
    const result = runGate(article, contextWith(article));
    expect(result.errors.some((e) => e.includes("pillar"))).toBe(true);
  });

  it("fails on an unknown author", () => {
    const article = validArticle({ authorSlug: "ghost-writer" });
    const result = runGate(article, contextWith(article));
    expect(result.errors.some((e) => e.includes("author"))).toBe(true);
  });

  it("fails an answer block outside 40-60 words", () => {
    const article = validArticle({ answerBlock: "Too short." });
    const result = runGate(article, contextWith(article));
    expect(result.errors.some((e) => e.includes("answer block"))).toBe(true);
  });

  it("fails with fewer than three structured sources", () => {
    const article = validArticle({ sources: validArticle().sources.slice(0, 2) });
    const result = runGate(article, contextWith(article));
    expect(result.errors.some((e) => e.includes("sources"))).toBe(true);
  });

  it("fails without a commercial internal link", () => {
    const article = validArticle({
      sections: [
        { heading: "Why no links?", paragraphs: ["No inline links in this variant at all."] },
      ],
      related: [
        { href: "/blog/how-to-start-yoga", anchor: "a" },
        { href: "/help/verification", anchor: "b" },
        { href: "/legal/terms", anchor: "c" },
      ],
    });
    const result = runGate(article, contextWith(article));
    expect(result.errors.some((e) => e.includes("commercial"))).toBe(true);
  });

  it("requires a clinical reviewer when clinical-area phrases appear", () => {
    const article = validArticle({
      sections: [
        {
          heading: "Is it safe during pregnancy?",
          paragraphs: ["Claims about pregnancy and blood pressure live here, with [a link](/directory)."],
          qualifier: "Please consult your doctor.",
        },
      ],
      disclaimer: "standard",
    });
    const result = runGate(article, contextWith(article));
    expect(result.errors.some((e) => e.includes('reviewTier "clinical"'))).toBe(true);
  });

  it("rejects a practice-tier reviewer signing clinical content", () => {
    const article = validArticle({
      reviewTier: "clinical",
      reviewerSlug: "koji-yamada", // practice tier only
      dateReviewed: "2026-07-01",
    });
    const result = runGate(article, contextWith(article));
    expect(result.errors.some((e) => e.includes("lacks a clinical-tier"))).toBe(true);
  });

  it("requires disclaimer + inline qualifier where high-risk phrases fire", () => {
    const article = validArticle({
      sections: [
        {
          heading: "What about injury?",
          paragraphs: ["Practising around an injury needs care, and [a link](/directory)."],
        },
      ],
    });
    const result = runGate(article, contextWith(article));
    expect(result.errors.some((e) => e.includes("disclaimer"))).toBe(true);
    expect(result.errors.some((e) => e.includes("qualifier"))).toBe(true);
  });

  it("requires health FAQ answers to carry their own qualifier", () => {
    const article = validArticle({
      disclaimer: "standard",
      faqs: [
        {
          id: "risky",
          question: "Is it safe?",
          answer: "Absolutely fine for everyone, always, in every circumstance, without exception, whatever your situation, whoever you are, wherever you practise, forever.",
          health: true,
        },
      ],
    });
    const result = runGate(article, contextWith(article));
    expect(result.errors.some((e) => e.includes("consult-your-doctor"))).toBe(true);
  });

  it("rejects reserved and colliding slugs", () => {
    const reserved = validArticle({ slug: "topics" });
    expect(
      runGate(reserved, contextWith(reserved)).errors.some((e) => e.includes("reserved")),
    ).toBe(true);

    const original = validArticle();
    const clone = validArticle({ title: "A different title" });
    const ctx: GateContext = {
      articles: [original, clone, ...contextWith(original).articles.slice(1)],
      clusters: CLUSTERS,
      authors: AUTHORS,
    };
    expect(runGate(clone, ctx).errors.some((e) => e.includes("collides"))).toBe(true);
  });

  it("flags near-duplicate bodies (scaled-content defence)", () => {
    const a = validArticle();
    const b = validArticle({ slug: "test-article-two", title: "What is another?" });
    const ctx: GateContext = {
      articles: [a, b, contextWith(a).articles[1]],
      clusters: CLUSTERS,
      authors: AUTHORS,
    };
    expect(runGate(b, ctx).errors.some((e) => e.includes("similarity"))).toBe(true);
  });
});

describe("linking helpers", () => {
  it("classifies commercial paths", () => {
    expect(isCommercialPath("/directory?styles=yin")).toBe(true);
    expect(isCommercialPath("/us/new-york/yoga")).toBe(true);
    expect(isCommercialPath("/teachers/koji")).toBe(true);
    expect(isCommercialPath("/blog/styles")).toBe(false);
    expect(isCommercialPath("/help/verification")).toBe(false);
  });

  it("extracts inline and related links", () => {
    const article = validArticle();
    const links = extractInternalLinks(article);
    expect(links.map((l) => l.href)).toContain("/directory?styles=hatha");
    expect(links.map((l) => l.href)).toContain("/help/verification");
  });

  it("proposes entity links without auto-inserting", () => {
    const article = validArticle({
      sections: [
        {
          heading: "Where in New York can you practise yin?",
          paragraphs: ["Yin rooms exist all over New York."],
        },
      ],
      related: validArticle().related,
    });
    const proposals = proposeEntityLinks(article);
    expect(proposals.some((p) => p.kind === "city" && p.href === "/us/new-york/yoga")).toBe(true);
    expect(proposals.some((p) => p.kind === "style" && p.entity === "yin")).toBe(true);
  });

  it("warns on uniform anchor text per destination", () => {
    const make = (slug: string) =>
      validArticle({
        slug,
        related: [
          { href: "/directory", anchor: "best yoga classes" },
          { href: "/blog/how-to-start-yoga", anchor: `varied ${slug}` },
          { href: "/help/verification", anchor: `also varied ${slug}` },
        ],
      });
    const warnings = anchorDistributionWarnings([make("a"), make("b"), make("c")]);
    expect(warnings.some((w) => w.href === "/directory" && w.anchor === "best yoga classes")).toBe(
      true,
    );
  });
});

describe("similarity + phrase detection primitives", () => {
  it("scores identical text at 1 and unrelated text near 0", () => {
    const text = "the quick brown fox jumps over the lazy dog repeatedly today";
    expect(similarityOf(text, text)).toBe(1);
    expect(similarityOf(text, "completely different words about retreat schedules in portugal")).toBe(0);
  });

  it("detects high-risk phrases case-insensitively", () => {
    expect(detectHighRiskPhrases("Managing Blood Pressure during Pregnancy")).toContain(
      "blood pressure",
    );
    expect(detectHighRiskPhrases("nothing risky here")).toEqual([]);
  });
});
