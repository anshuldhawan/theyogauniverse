"use client";

/**
 * PostHog browser capture (ANL-1 client half): pageviews, autocapture, web
 * vitals and session replay. Initialises only when the Vercel Marketplace
 * integration has provisioned NEXT_PUBLIC_POSTHOG_KEY — absent keys mean dev
 * offline mode and everything below is inert.
 *
 * Replay privacy defaults: all inputs masked; `data-ph-mask` hides element
 * text, `data-ph-block` excludes an element entirely. Any UI rendering
 * personal data, health notes, messages or payment fields must carry one of
 * these attributes (agents.md rule 9).
 */

import { useAuth, useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { PostHogProvider as Provider, usePostHog } from "posthog-js/react";
import { useEffect, useRef } from "react";

let initialised = false;

function init(): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || initialised) return;
  initialised = true;
  posthog.init(key, {
    // Reverse-proxied through next.config.ts rewrites so ad blockers don't
    // silently drop a large share of events.
    api_host: "/ingest",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    // Anonymous visitors still feed web analytics; full person profiles are
    // created on Clerk identify (cost control + privacy minimisation).
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    capture_pageleave: true,
    respect_dnt: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-ph-mask]",
      blockSelector: "[data-ph-block]",
    },
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Init during client render (not in an effect) so child effects such as
  // PostHogIdentify observe an initialised client on first mount.
  if (typeof window !== "undefined") init();
  return <Provider client={posthog}>{children}</Provider>;
}

/** Stitch Clerk identity to the PostHog person; reset on sign-out. */
export function PostHogIdentify() {
  const posthogClient = usePostHog();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const identified = useRef(false);
  useEffect(() => {
    if (!initialised) return;
    if (isSignedIn && userId) {
      const email = user?.primaryEmailAddress?.emailAddress;
      posthogClient.identify(userId, email ? { email } : {});
      identified.current = true;
    } else if (isSignedIn === false && identified.current) {
      posthogClient.reset();
      identified.current = false;
    }
  }, [isSignedIn, userId, user, posthogClient]);
  return null;
}
