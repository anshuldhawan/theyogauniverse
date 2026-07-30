import { z } from "zod";
import { track } from "@/lib/analytics";

/**
 * BLG-42 — browser beacon for blog funnel events. Deliberately narrow: only
 * the client-originated blog events are accepted; everything else is tracked
 * server-side where it can't be spoofed.
 */
const beaconSchema = z.object({
  name: z.enum(["article_commercial_click"]),
  payload: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

export async function POST(request: Request) {
  const parsed = beaconSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  track({ name: parsed.data.name, subjectTransactability: null, payload: parsed.data.payload });
  return new Response(null, { status: 204 });
}
