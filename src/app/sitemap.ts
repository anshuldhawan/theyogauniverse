import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/config/markets";
import { authors, publishedArticles, reviewStatus } from "@/lib/editorial/store";
import { allProviders, providersByCity } from "@/lib/repo";
import { cityPageIndexable, siteUrl } from "@/lib/seo";
import { cityHubPath, providerPath } from "@/lib/urls";

/**
 * SEO-8: segmented sitemap. Only indexable pages are included — city hubs
 * below the SEO-4 threshold are omitted, matching their noindex state.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  const staticPages = [
    "",
    "/directory",
    "/blog",
    "/guides/yoga-sutras",
    "/places/rishikesh",
    "/help/how-booking-works",
    "/help/verification",
    "/legal/editorial-policy",
  ].map((path) => ({ url: `${base}${path}` }));

  const providerPages = allProviders().map((provider) => ({
    url: `${base}${providerPath(provider)}`,
    lastModified: new Date(provider.lastVerifiedAt),
  }));

  const cityPages = CITIES.filter((city) => cityPageIndexable(providersByCity(city.slug))).map(
    (city) => ({ url: `${base}${cityHubPath(city.country, city.slug)}` }),
  );

  // BLG-17: lastmod reflects real substantive changes (dateModified moves
  // only by editor declaration, BLG-63). Review-decayed articles are noindex
  // (BLG-24) and therefore omitted, matching their meta state.
  const now = new Date();
  const articlePages = publishedArticles()
    .filter((article) => reviewStatus(article, now) !== "noindex")
    .map((article) => ({
      url: `${base}/blog/${article.slug}`,
      lastModified: new Date(article.dateModified),
    }));

  const authorPages = authors().map((author) => ({
    url: `${base}/authors/${author.slug}`,
  }));

  return [...staticPages, ...providerPages, ...cityPages, ...articlePages, ...authorPages];
}
