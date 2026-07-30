import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { allProviders, primaryListingOf } from "@/lib/repo";
import { providerPath } from "@/lib/urls";
import { siteUrl } from "@/lib/seo";

/**
 * INT-8 — public read API, v1. Read-only index data: no contact details, no
 * booking endpoints (write access arrives with API keys and per-key quotas).
 * Rate-limited per IP (TSF-9 shares the limiter).
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const limit = await rateLimit(`api-v1:${ip}`, { limit: 60, windowSeconds: 60 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const category = searchParams.get("category");

  const items = allProviders()
    .filter((p) => (city ? p.citySlug === city : true))
    .filter((p) => (category ? p.category === category : true))
    .map((p) => {
      const listing = primaryListingOf(p.id);
      return {
        id: p.id,
        name: p.name,
        kind: p.kind,
        category: p.category,
        city: p.cityName,
        country: p.country,
        styles: p.styles,
        verificationTier: p.verificationTier,
        listingType: listing?.type ?? null,
        url: `${siteUrl()}${providerPath(p)}`,
      };
    });

  return NextResponse.json(
    { version: "v1", count: items.length, items },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
