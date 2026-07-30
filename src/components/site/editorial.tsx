import Link from "next/link";
import type { ReactNode } from "react";
import { SectionLabel, VerifiedMark } from "@/components/ui";
import { DISCLAIMER_COPY } from "@/lib/editorial/disclaimers";
import type { Article, EditorialAuthor } from "@/lib/editorial/types";

/* ------------------------------ inline links ------------------------------ */

const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/**
 * Render a paragraph containing editor-approved [anchor](/path) links
 * (BLG-25). Only relative internal hrefs become links; anything else renders
 * as text — external links live in the References block, not the body.
 */
export function Prose({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(MARKDOWN_LINK)) {
    const [full, anchor, href] = match;
    nodes.push(text.slice(last, match.index));
    if (href.startsWith("/")) {
      nodes.push(
        <Link key={i++} href={href} className="underline decoration-sage underline-offset-2">
          {anchor}
        </Link>,
      );
    } else {
      nodes.push(anchor);
    }
    last = match.index + full.length;
  }
  nodes.push(text.slice(last));
  return <p className="text-[17.5px] leading-[1.8] text-article text-pretty">{nodes}</p>;
}

/* -------------------------- BLG-35 answer block --------------------------- */

export function AnswerBlock({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-sage bg-mint p-6.5">
      <SectionLabel className="mb-3">The short answer</SectionLabel>
      <p className="text-[17.5px] leading-[1.7] text-forest text-pretty">{text}</p>
    </div>
  );
}

/* --------------------------- BLG-32 trust block ---------------------------- */

export function TrustBlock({
  article,
  author,
  reviewer,
}: {
  article: Article;
  author: EditorialAuthor;
  reviewer: EditorialAuthor | null;
}) {
  const credentialLine = (person: EditorialAuthor) =>
    person.credentials.map((c) => c.label).join(", ");
  return (
    <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-y border-mint-200 py-4.5 text-[13px] text-muted">
      <span>
        Written by{" "}
        <Link href={`/authors/${author.slug}`} className="text-forest underline">
          {author.name}
        </Link>{" "}
        · {credentialLine(author)}
        {author.state === "former" && " · former contributor"}
      </span>
      {reviewer && article.dateReviewed && (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <VerifiedMark compact />
          Reviewed by{" "}
          <Link href={`/authors/${reviewer.slug}`} className="text-forest underline">
            {reviewer.name}
          </Link>{" "}
          · {credentialLine(reviewer)} · {formatDate(article.dateReviewed)}
        </span>
      )}
      <span>
        Published {formatDate(article.datePublished)} · Updated{" "}
        {formatDate(article.dateModified)}
      </span>
    </div>
  );
}

/* ------------------------ BLG-47a medical disclaimer ----------------------- */

export function MedicalDisclaimer({ variant }: { variant: "standard" | "high-risk" }) {
  return (
    <aside
      className="mt-6 rounded-[14px] border border-kind-border bg-[#fff7f0] p-4.5 text-[14px] leading-relaxed text-cta-body"
      aria-label="Medical disclaimer"
    >
      {DISCLAIMER_COPY[variant]}
    </aside>
  );
}

/** Inline qualifier rendered beside the claim it qualifies (BLG-47a). */
export function InlineQualifier({ text }: { text: string }) {
  return (
    <p className="border-l-2 border-sage pl-4.5 font-heading text-[16px] italic text-muted">
      {text}
    </p>
  );
}

/* ------------------------------ BLG-39 FAQ -------------------------------- */

export function FaqBlock({ faqs }: { faqs: Article["faqs"] }) {
  if (faqs.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="display-4 mb-5">Common questions</h2>
      <dl className="flex flex-col gap-6">
        {faqs.map((faq) => (
          <div key={faq.id} id={faq.id} className="scroll-mt-24">
            <dt className="heading-card text-[20px]">{faq.question}</dt>
            <dd className="mt-2 text-[16px] leading-[1.75] text-article">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* --------------------------- BLG-33 references ----------------------------- */

export function ReferenceList({ sources }: { sources: Article["sources"] }) {
  if (sources.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="display-4 mb-5">References</h2>
      <ol className="flex list-decimal flex-col gap-2.5 pl-5 text-[14px] leading-relaxed text-muted">
        {sources.map((source, i) => (
          <li key={i}>
            {source.author} ({source.publishedYear}).{" "}
            <a href={source.url} rel="noopener" target="_blank" className="underline">
              {source.publication}
            </a>
            . Supports: {source.claim} Accessed {formatDate(source.dateAccessed)}.
            {source.archiveUrl && (
              <>
                {" "}
                <a
                  href={source.archiveUrl}
                  rel="noopener"
                  target="_blank"
                  className="text-faint underline"
                >
                  [archived]
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------ article card ------------------------------ */

export function ArticleCard({
  article,
  clusterName,
}: {
  article: Article;
  clusterName?: string;
}) {
  return (
    <Link href={`/blog/${article.slug}`} className="flex flex-col gap-3">
      <div
        className="flex h-47.5 items-end rounded-[14px] p-4"
        style={{ background: article.tint }}
      >
        <span className="rounded-full bg-white px-2.75 py-1.5 text-[10.5px] uppercase tracking-[0.2em] text-forest">
          {clusterName ?? article.format}
        </span>
      </div>
      <h3 className="heading-card mt-1 text-[23px] leading-[1.25] text-pretty">
        {article.title}
      </h3>
      <p className="text-[14.5px] leading-[1.65] text-muted">{article.excerpt}</p>
      <span className="text-[12px] text-faint">
        {article.minutes} min read · Updated {formatDate(article.dateModified)}
      </span>
    </Link>
  );
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
