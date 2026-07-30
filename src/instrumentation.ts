/**
 * Sentry (phase 3, provisioned via the Vercel Marketplace integration).
 * Errors and server traces only — session replay stays with PostHog so the
 * two systems don't double-record. Entirely inert until NEXT_PUBLIC_SENTRY_DSN
 * is provisioned, keeping `pnpm dev` offline-clean.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export async function register() {
  if (!dsn) return;
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
    });
  }
}

export const onRequestError = dsn ? Sentry.captureRequestError : undefined;
