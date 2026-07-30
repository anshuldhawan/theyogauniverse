/**
 * Experimentation scaffolding (phase 3): PostHog-backed feature flags and
 * A/B test variants. Create the flag or experiment in PostHog first (Vercel
 * dashboard → Open in PostHog), then gate in Server Components or Actions:
 *
 *   const variant = await featureFlagValue("new-checkout");
 *   if (variant === "test") …
 *
 * Always `false` when PostHog keys are absent (dev offline) or the person
 * can't be resolved, so flag-gated UI must treat `false` as the control path.
 */

import { currentUser } from "@/lib/auth";
import { posthogDistinctId, posthogServer } from "@/lib/posthog-server";

export async function featureFlagValue(key: string): Promise<boolean | string> {
  const posthog = await posthogServer();
  if (!posthog) return false;
  const user = await currentUser();
  const distinctId = user?.clerkUserId ?? (await posthogDistinctId());
  if (!distinctId) return false;
  try {
    return (await posthog.getFeatureFlag(key, distinctId)) ?? false;
  } catch {
    return false;
  }
}

export async function featureEnabled(key: string): Promise<boolean> {
  return (await featureFlagValue(key)) === true;
}
