import { type NextRequest, NextResponse } from "next/server";
import { affiliateCookie, createAffiliateAttribution } from "@/lib/affiliate";
import { listingById, organisationById } from "@/lib/repo";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { partner?: string; listingId?: string }
    | null;
  const listing = body?.listingId ? listingById(body.listingId) : undefined;
  const organisation = listing ? organisationById(listing.organisationId) : undefined;
  if (!body?.partner || !listing || !organisation) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase() ?? null;
  const token = createAffiliateAttribution({
    partner: body.partner,
    listing,
    organisation,
    buyer: { country },
  });
  if (!token) {
    // Advertising-only inventory reaches this branch before any tracking is recorded.
    return NextResponse.json({ attributed: false }, { status: 422 });
  }
  return NextResponse.json(
    { attributed: true },
    { headers: { "Set-Cookie": affiliateCookie(token), "Cache-Control": "no-store" } },
  );
}
