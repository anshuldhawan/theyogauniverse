"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useCallback, useEffect, useState } from "react";
import { PostHogIdentify, PostHogProvider } from "@/components/posthog-provider";
import {
  mayLoadCategory,
  resolveConsent,
  type ConsentState,
} from "@/lib/compliance";

const COOKIE = "privacy_consent";

function readConsent(): ConsentState | null {
  const raw = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as ConsentState;
  } catch {
    return null;
  }
}

function browserGpc(): boolean {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function ComplianceProviders({
  children,
  identify = false,
}: {
  children: React.ReactNode;
  identify?: boolean;
}) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);

  const save = useCallback((analytics: boolean, marketing: boolean) => {
    const next = resolveConsent({
      analytics,
      marketing,
      globalPrivacyControl: browserGpc(),
    });
    document.cookie =
      `${COOKIE}=${encodeURIComponent(JSON.stringify(next))}; Path=/; Max-Age=31536000; ` +
      "SameSite=Lax; Secure";
    setConsent(next);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const existing = readConsent();
      if (browserGpc() && (!existing || !existing.gpcHonoured)) {
        save(false, false);
      } else {
        setConsent(existing);
      }
      setReady(true);
    });

    const open = () => setConsent(null);
    window.addEventListener("open-privacy-choices", open);
    return () => window.removeEventListener("open-privacy-choices", open);
  }, [save]);

  const analyticsAllowed = mayLoadCategory(consent, "analytics");
  const content = analyticsAllowed ? (
    <PostHogProvider>
      {identify && <PostHogIdentify />}
      {children}
      <Analytics />
      <SpeedInsights />
    </PostHogProvider>
  ) : (
    children
  );

  return (
    <>
      {content}
      {ready && !consent && (
        <aside
          aria-label="Privacy choices"
          className="fixed right-4 bottom-4 left-4 z-[100] mx-auto max-w-2xl rounded-[14px] border border-mint-200 bg-white p-5 shadow-xl"
        >
          <h2 className="font-heading text-xl text-forest">Your privacy choices</h2>
          <p className="mt-2 text-sm leading-relaxed text-body">
            Necessary cookies keep the site working. Analytics stays off unless you choose
            it. Global Privacy Control is honoured automatically and disables optional
            tracking.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => save(false, false)}
              className="rounded-full border border-forest px-4 py-2 text-sm text-forest"
            >
              Necessary only
            </button>
            {!browserGpc() && (
              <button
                type="button"
                onClick={() => save(true, false)}
                className="rounded-full bg-forest px-4 py-2 text-sm text-white"
              >
                Allow analytics
              </button>
            )}
          </div>
        </aside>
      )}
    </>
  );
}

export function PrivacyChoicesButton() {
  return (
    <button
      type="button"
      className="text-sage-600 hover:text-amber"
      onClick={() => window.dispatchEvent(new Event("open-privacy-choices"))}
    >
      Privacy choices
    </button>
  );
}
