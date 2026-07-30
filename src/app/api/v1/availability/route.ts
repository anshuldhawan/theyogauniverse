import { type NextRequest, NextResponse } from "next/server";
import { validPartnerApiKey } from "@/lib/partner-api";
import { rateLimit } from "@/lib/ratelimit";
import { allProviders, primaryListingOf, slotsForProvider } from "@/lib/repo";

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!validPartnerApiKey(apiKey)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const limited = await rateLimit(`partner-api:${apiKey}`, { limit: 300, windowSeconds: 60 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds ?? 60) } },
    );
  }
  const providerId = new URL(request.url).searchParams.get("providerId");
  const items = allProviders()
    .filter((provider) => !providerId || provider.id === providerId)
    .flatMap((provider) => {
      const listing = primaryListingOf(provider.id);
      if (!listing) return [];
      return slotsForProvider(provider.id).map((slot) => ({
        listingId: listing.id,
        occurrenceId: slot.id,
        starts: { day: slot.day, time: slot.time, timezone: slot.timezone },
        capacity: slot.capacity,
        available: Math.max(0, slot.capacity - slot.booked),
      }));
    });
  return NextResponse.json(
    { version: "v1", count: items.length, items },
    { headers: { "Cache-Control": "private, max-age=15" } },
  );
}
