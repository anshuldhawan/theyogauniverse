/**
 * BLG Appendix A — the AEO article template. Order is contractual:
 * H1 → answer block (first content, BLG-35/64) → trust block (BLG-32) →
 * medical disclaimer on health topics (BLG-47a) → question-shaped H2 sections
 * (BLG-37) with tables/lists (BLG-38) and inline qualifiers → FAQ with
 * fragment-addressable ids (BLG-39) → References (BLG-33) → related-on-
 * platform links (BLG-26) → policy footer (BLG-46/48a).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { BlogAttribution, CommercialLinks } from "@/components/site/BlogAttribution";
import {
  AnswerBlock,
  ArticleCard,
  FaqBlock,
  formatDate,
  InlineQualifier,
  MedicalDisclaimer,
  Prose,
  ReferenceList,
  TrustBlock,
} from "@/components/site/editorial";
import { ButtonLink, SectionLabel } from "@/components/ui";
import {
  articleBySlug,
  authorBySlug,
  clusterById,
  clusterPosts,
  pillarOf,
  publishedArticles,
  reviewStatus,
} from "@/lib/editorial/store";
import { track } from "@/lib/analytics";
import { siteUrl } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return publishedArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return {};
  const author = authorBySlug(article.authorSlug);
  // BLG-24: six months past review-due, the article drops to noindex.
  const decayed = reviewStatus(article, new Date()) === "noindex";
  return {
    title: article.title,
    description: article.answerBlock.slice(0, 155),
    alternates: { canonical: `/blog/${article.slug}` },
    robots: decayed ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: `${siteUrl()}/blog/${article.slug}`,
      siteName: "The Yoga Universe",
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      authors: author ? [`${siteUrl()}/authors/${author.slug}`] : undefined,
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  const author = authorBySlug(article.authorSlug);
  const reviewer = article.reviewerSlug ? authorBySlug(article.reviewerSlug) ?? null : null;
  const cluster = clusterById(article.clusterId);
  const pillar = pillarOf(article.clusterId);
  const siblings = clusterPosts(article.clusterId).filter((a) => a.slug !== article.slug);
  const base = siteUrl();

  // BLG-42: blog funnel entry point.
  track({
    name: "article_view",
    subjectTransactability: null,
    payload: { article: article.slug, cluster: article.clusterId, format: article.format },
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url: `${base}/blog/${article.slug}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: author && {
      "@type": "Person",
      name: author.name,
      url: `${base}/authors/${author.slug}`,
      jobTitle: author.role,
    },
    ...(reviewer && article.dateReviewed
      ? {
          reviewedBy: {
            "@type": "Person",
            name: reviewer.name,
            url: `${base}/authors/${reviewer.slug}`,
            jobTitle: reviewer.role,
          },
        }
      : {}),
    publisher: { "@type": "Organization", name: "The Yoga Universe", url: base },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: `${base}/blog` },
      ...(cluster && pillar
        ? [{ "@type": "ListItem", position: 2, name: cluster.name, item: `${base}/blog/${pillar.slug}` }]
        : []),
      {
        "@type": "ListItem",
        position: cluster && pillar ? 3 : 2,
        name: article.title,
        item: `${base}/blog/${article.slug}`,
      },
    ],
  };

  // BLG-36: FAQPage markup is emitted for machine extraction only — FAQ rich
  // results were removed from Google SERP in June 2026. Never a SERP feature.
  const faqSchema =
    article.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            url: `${base}/blog/${article.slug}#${faq.id}`,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  return (
    <article className="shell-720 page-y">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      <BlogAttribution slug={article.slug} />

      <nav aria-label="Breadcrumb" className="link-back">
        <Link href="/blog" className="link-back">
          ← The blog
        </Link>
        {cluster && pillar && article.slug !== pillar.slug && (
          <>
            <span className="text-faint"> / </span>
            <Link href={`/blog/${pillar.slug}`} className="link-back">
              {cluster.name}
            </Link>
          </>
        )}
      </nav>

      {cluster && (
        <p className="mt-7.5 mb-3.5 text-[10.5px] uppercase tracking-[0.22em] text-leaf">
          {cluster.name}
        </p>
      )}
      <h1 className="font-heading text-[clamp(30px,4.6vw,50px)] leading-[1.1] font-light tracking-[-0.02em] text-pretty">
        {article.title}
      </h1>
      <p className="mt-5 text-[13.5px] text-faint">
        {article.minutes} min read · Updated {formatDate(article.dateModified)}
      </p>
      <div
        className="mt-8 h-[clamp(180px,26vw,300px)] rounded-2xl"
        style={{ background: article.tint }}
        aria-hidden
      />

      <div className="mt-10">
        <AnswerBlock text={article.answerBlock} />
      </div>

      {author && <TrustBlock article={article} author={author} reviewer={reviewer} />}

      {article.disclaimer !== "none" && <MedicalDisclaimer variant={article.disclaimer} />}

      <div className="mt-11 flex flex-col gap-11">
        {article.sections.map((section, i) => (
          <section key={i}>
            <h2 className="display-4 mb-4">{section.heading}</h2>
            <div className="flex flex-col gap-6.5">
              {section.paragraphs.map((paragraph, j) => (
                <Prose key={j} text={paragraph} />
              ))}
              {section.list && (
                <ol
                  className={`flex flex-col gap-2.5 pl-5 text-[17.5px] leading-[1.8] text-article ${
                    section.list.ordered ? "list-decimal" : "list-disc"
                  }`}
                >
                  {section.list.items.map((item, j) => (
                    <li key={j}>
                      <Prose text={item} />
                    </li>
                  ))}
                </ol>
              )}
              {section.table && (
                <div className="overflow-x-auto rounded-[14px] border border-mint-200">
                  <table className="w-full border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        {section.table.headers.map((header, j) => (
                          <th
                            key={j}
                            scope="col"
                            className="border-b border-mint-200 bg-mint px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-leaf"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, j) => (
                        <tr key={j}>
                          {row.map((cell, k) => (
                            <td
                              key={k}
                              className="border-b border-mint-200 px-4 py-3 align-top text-body"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.qualifier && <InlineQualifier text={section.qualifier} />}
            </div>
          </section>
        ))}
      </div>

      <FaqBlock faqs={article.faqs} />
      <ReferenceList sources={article.sources} />

      {article.related.length > 0 && (
        <section className="mt-12 rounded-[18px] border border-mint-200 bg-mint-wash p-6.5">
          <h2 className="heading-card mb-1 text-[22px]">On The Yoga Universe</h2>
          <CommercialLinks articleSlug={article.slug} links={article.related} />
        </section>
      )}

      {/* The prototype's closing band: name the practice, then send them to the index. */}
      <div className="mt-12 border-t border-mint-200 pt-8">
        <SectionLabel className="mb-4">Find someone for this</SectionLabel>
        <ButtonLink href="/directory" tone="forest">
          Browse the index
        </ButtonLink>
      </div>

      {siblings.length > 0 && (
        <section className="mt-12">
          <h2 className="display-4 mb-5">More in {cluster?.name.toLowerCase()}</h2>
          <div className="grid-fit-280 gap-8">
            {siblings.slice(0, 4).map((sibling) => (
              <ArticleCard key={sibling.slug} article={sibling} clusterName={cluster?.name} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-12 border-t border-mint-200 pt-6 text-[13px] leading-relaxed text-faint">
        <p>
          {article.aiAssisted
            ? "Drafted with AI assistance; reviewed, edited and fact-checked by the named author, who is accountable for its accuracy."
            : "Written by the named author, who is accountable for its accuracy."}{" "}
          Read our{" "}
          <Link href="/legal/editorial-policy" className="underline">
            editorial policy
          </Link>{" "}
          and{" "}
          <Link href="/legal/editorial-policy#corrections" className="underline">
            corrections log
          </Link>
          . Last substantive update {formatDate(article.dateModified)} · next scheduled review{" "}
          {formatDate(article.nextReviewDue)}.
        </p>
        <p className="mt-3">
          <Link href="/blog" className="link-back">
            ← All guides
          </Link>
        </p>
      </footer>
    </article>
  );
}
