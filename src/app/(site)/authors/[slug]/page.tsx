/**
 * BLG-30 — indexable author profiles: the E-E-A-T anchor for every byline.
 * Person + ProfilePage schema, credential display reusing the CRD vocabulary,
 * authored/reviewed lists, and the platform teacher cross-link (BLG-29).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ArticleCard } from "@/components/site/editorial";
import { Eyebrow, SectionLabel, Tag, VerifiedMark } from "@/components/ui";
import { articlesByAuthor, authorBySlug, authors, clusterById } from "@/lib/editorial/store";
import { siteUrl } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return authors().map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = authorBySlug(slug);
  if (!author) return {};
  return {
    title: `${author.name} — ${author.role}`,
    description: author.bio.slice(0, 155),
    alternates: { canonical: `/authors/${author.slug}` },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = authorBySlug(slug);
  if (!author) notFound();

  const { authored, reviewed } = articlesByAuthor(author.slug);
  const base = siteUrl();

  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: author.name,
      url: `${base}/authors/${author.slug}`,
      jobTitle: author.role,
      description: author.bio,
      knowsAbout: author.expertise,
      hasCredential: author.credentials.map((credential) => ({
        "@type": "EducationalOccupationalCredential",
        name: credential.label,
        recognizedBy: { "@type": "Organization", name: credential.issuer },
      })),
      sameAs: author.sameAs,
    },
  };

  return (
    <div className="shell-760 page-y">
      <JsonLd data={schema} />
      <Eyebrow className="mb-3">
        {author.state === "former" ? "Former contributor" : "Editorial team"}
      </Eyebrow>
      <h1 className="display-2">{author.name}</h1>
      <p className="mt-2.5 text-[15px] text-muted">
        {author.role} · {author.yearsPractice} years of practice
      </p>

      <div className="mt-4.5 flex flex-wrap items-center gap-2">
        {author.credentials.map((credential) => (
          <Tag key={credential.label}>
            {credential.label} · {credential.issuer}
          </Tag>
        ))}
        <VerifiedMark />
      </div>

      <p className="mt-6.5 text-[17px] leading-[1.75] text-article text-pretty">
        {author.bio}
      </p>

      <div className="mt-4.5 flex flex-wrap gap-2">
        {author.expertise.map((topic) => (
          <Tag key={topic}>{topic}</Tag>
        ))}
      </div>

      {author.teacherSlug && (
        <div className="mt-8 rounded-[18px] bg-mint p-6">
          <SectionLabel className="mb-2.5">Teaches on The Yoga Universe</SectionLabel>
          <p className="text-[15px] leading-relaxed text-body">
            {author.name.split(" ")[0]} also teaches on the platform — see{" "}
            <Link href={`/teachers/${author.teacherSlug}`} className="underline">
              their teacher profile
            </Link>{" "}
            for verified credentials, schedule and booking.
          </p>
        </div>
      )}

      {authored.length > 0 && (
        <section className="mt-11">
          <h2 className="display-4 mb-5">Written by {author.name.split(" ")[0]}</h2>
          <div className="grid-fit-280 gap-8">
            {authored.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                clusterName={clusterById(article.clusterId)?.name}
              />
            ))}
          </div>
        </section>
      )}

      {reviewed.length > 0 && (
        <section className="mt-11">
          <h2 className="display-4 mb-5">Reviewed by {author.name.split(" ")[0]}</h2>
          <div className="grid-fit-280 gap-8">
            {reviewed.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                clusterName={clusterById(article.clusterId)?.name}
              />
            ))}
          </div>
        </section>
      )}

      <p className="mt-11 border-t border-mint-200 pt-6 text-[13px] leading-relaxed text-faint">
        Author profiles exist so every claim on this site traces to a named, credentialed person.
        Read our{" "}
        <Link href="/legal/editorial-policy" className="underline">
          editorial policy
        </Link>
        .
      </p>
    </div>
  );
}
