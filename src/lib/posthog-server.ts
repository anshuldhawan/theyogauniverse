/**
 * ANL-1 production sink: governed events stream to PostHog, provisioned via
 * the Vercel Marketplace integration (`NEXT_PUBLIC_POSTHOG_KEY` /
 * `NEXT_PUBLIC_POSTHOG_HOST` are auto-injected). No-op when keys are absent so
 * `pnpm dev` stays fully offline (agents.md rule 7). Server-side only —
 * browser capture (pageviews, autocapture, session replay) is owned by
 * posthog-js in src/components/posthog-provider.tsx.
 *
 * All server-only imports are dynamic so this module is safe to pull into any
 * bundle; it returns null in the browser before touching them.
 */

import type { PostHog } from "posthog-node";

let client: PostHog | null = null;

export async function posthogServer(): Promise<PostHog | null> {
  if (typeof window !== "undefined") return null;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!client) {
    const { PostHog } = await import("posthog-node");
    client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      // Serverless: deliver immediately rather than batching for a flush that
      // may never run before the function freezes.
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

/**
 * posthog-js stores the anonymous distinct id in the `ph_<key>_posthog`
 * cookie. Reusing it stitches server events (booking_confirmed, …) to the
 * same PostHog person as the browser session; Clerk sign-in then merges the
 * anonymous profile via identify() on the client.
 */
export async function posthogDistinctId(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const raw = store.get(`ph_${process.env.NEXT_PUBLIC_POSTHOG_KEY}_posthog`)?.value;
    if (!raw) return null;
    return (JSON.parse(raw) as { distinct_id?: string }).distinct_id ?? null;
  } catch {
    return null;
  }
}

export async function captureGovernedEvent(
  name: string,
  properties: Record<string, string | number | boolean | null>,
): Promise<void> {
  const posthog = await posthogServer();
  if (!posthog) return;
  const distinctId = (await posthogDistinctId()) ?? "server-anonymous";
  const delivery = posthog
    .captureImmediate({ distinctId, event: name, properties })
    .catch(() => undefined);
  try {
    const { waitUntil } = await import("@vercel/functions");
    waitUntil(delivery);
  } catch {
    await delivery;
  }
}
