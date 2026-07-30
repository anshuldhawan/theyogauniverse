import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * SEO-11: AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…)
 * are ALLOWED by default — being quoted by assistants is distribution.
 * Only genuinely private surfaces are disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/book/", "/claim/", "/api/"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
