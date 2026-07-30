import { getLocale } from "next-intl/server";
import Link from "next/link";
import { SectionLabel } from "@/components/ui";
import { formatDate } from "@/components/site/editorial";
import type { Article } from "@/lib/editorial/types";

/**
 * BLG-27 — reverse surfacing: a related-editorial module on commercial pages
 * (city hubs, style-filtered directory views). Editorial content exists only
 * in English, so the module is suppressed on non-`en` locales rather than
 * mixing languages into a localised page (BLG-6).
 */
export async function RelatedEditorial({
  articles,
  heading = "Guides from our editorial team",
}: {
  articles: Article[];
  heading?: string;
}) {
  const locale = await getLocale();
  if (locale !== "en" || articles.length === 0) return null;

  return (
    <section className="mt-14 max-w-3xl">
      <SectionLabel className="mb-3">From the library</SectionLabel>
      <h2 className="display-4 mb-4.5">{heading}</h2>
      <ul className="flex flex-col gap-2.5">
        {articles.map((article) => (
          <li
            key={article.slug}
            className="rounded-[14px] border border-mint-200 bg-white p-4.5 transition-colors hover:border-sage"
          >
            <Link href={`/blog/${article.slug}`} className="heading-card text-xl text-forest">
              {article.title}
            </Link>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
              {article.excerpt} · {article.minutes} min read · Updated{" "}
              {formatDate(article.dateModified)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
