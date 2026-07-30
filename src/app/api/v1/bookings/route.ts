import { type NextRequest, NextResponse } from "next/server";
import { validPartnerApiKey } from "@/lib/partner-api";
import { rateLimit } from "@/lib/ratelimit";
import { bookingByReference } from "@/lib/repo";

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
  const reference = new URL(request.url).searchParams.get("reference")?.toUpperCase();
  if (!reference) return NextResponse.json({ error: "reference_required" }, { status: 400 });
  const booking = bookingByReference(reference);
  if (!booking) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    version: "v1",
    booking: {
      id: booking.id,
      reference: booking.reference,
      providerId: booking.providerId,
      listingId: booking.listingId,
      occurrenceId: booking.slotId,
      state: booking.state,
      createdAt: booking.createdAt,
    },
  });
}
