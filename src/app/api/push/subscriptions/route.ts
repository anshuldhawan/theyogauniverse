import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingByReference } from "@/lib/repo";
import { registerPushSubscription } from "@/lib/web-push";

const schema = z.object({
  reference: z.string().regex(/^SH-[A-Z0-9]{6}$/),
  subscription: z.object({
    endpoint: z.string().url().startsWith("https://"),
    expirationTime: z.number().nullable().optional(),
    keys: z.object({ p256dh: z.string().min(20), auth: z.string().min(8) }),
  }),
});

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
  const booking = bookingByReference(parsed.data.reference);
  if (!booking) return NextResponse.json({ error: "not_found" }, { status: 404 });
  registerPushSubscription(booking.reference, parsed.data.subscription);
  return new NextResponse(null, { status: 204 });
}
